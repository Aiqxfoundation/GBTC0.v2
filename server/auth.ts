import { type Express } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import * as ed25519 from "@noble/ed25519";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      user?: SelectUser;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

// In-memory store for login challenges (nonces)
// In production, this could be Redis or similar
const challengeStore = new Map<string, { nonce: string; expiresAt: number }>();

// Clean up expired challenges every minute
setInterval(() => {
  const now = Date.now();
  Array.from(challengeStore.entries()).forEach(([username, challenge]) => {
    if (challenge.expiresAt < now) {
      challengeStore.delete(username);
    }
  });
}, 60000);

// Helper function to verify Ed25519 signature
async function verifySignature(publicKeyHex: string, message: string, signatureHex: string): Promise<boolean> {
  try {
    const publicKey = new Uint8Array(Buffer.from(publicKeyHex, 'hex'));
    const signature = new Uint8Array(Buffer.from(signatureHex, 'hex'));
    const messageBytes = new Uint8Array(Buffer.from(message, 'utf-8'));
    
    return await ed25519.verify(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'gbtc-mining-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Helper middleware to set user on request
  app.use((req, res, next) => {
    if (req.session?.userId) {
      storage.getUser(req.session.userId).then(user => {
        if (user) {
          req.user = user;
        }
        next();
      }).catch(() => next());
    } else {
      next();
    }
  });

  // Registration endpoint - takes username and publicKey
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, publicKey, referredBy } = req.body;
      
      if (!username || !publicKey) {
        return res.status(400).json({ message: "Username and public key are required" });
      }

      // Validate public key format (64 hex characters for Ed25519)
      if (!/^[a-fA-F0-9]{64}$/.test(publicKey)) {
        return res.status(400).json({ message: "Invalid public key format" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Generate unique hash-style referral code (8 characters, alphanumeric)
      const generateReferralCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        let code = '';
        // Generate a more hash-like code with mixed case
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Add timestamp component for uniqueness
        const timestamp = Date.now().toString(36).slice(-2).toUpperCase();
        return code.slice(0, 6) + timestamp;
      };

      // Validate referral code if provided
      let validatedReferredBy = undefined;
      if (referredBy) {
        const referrer = await storage.findUserByOwnReferralCode(referredBy);
        if (referrer) {
          validatedReferredBy = referredBy;
        }
        // If referral code doesn't exist, we just ignore it (don't throw error)
      }

      const user = await storage.createUser({
        username,
        publicKey,
        referralCode: generateReferralCode(),
        referredBy: validatedReferredBy,
        // Note: hashPower and baseHashPower will be set by database defaults
      });

      // SECURITY FIX: Regenerate session to prevent session fixation
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session
      req.session.userId = user.id;
      req.user = user;
      
      res.status(201).json(user);
    } catch (error: any) {
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        return res.status(503).json({ message: "Database is reactivating. Please try again in a moment." });
      }
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('public_key')) {
          return res.status(400).json({ message: "This public key is already registered" });
        }
        return res.status(400).json({ message: "Username already exists" });
      }
      next(error);
    }
  });

  // Challenge endpoint - generates a nonce for login
  app.post("/api/login/challenge", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      // SECURITY FIX: Always generate nonce regardless of user existence to prevent username enumeration
      const nonce = randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 60000; // 1 minute expiry

      // Check if user exists, but don't reveal this in the response
      const user = await storage.getUserByUsername(username);
      
      // Only store challenge if user actually exists (but always return success)
      if (user) {
        challengeStore.set(username, { nonce, expiresAt });
      }

      // Always return the same response regardless of user existence
      res.json({ nonce });
    } catch (error: any) {
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        return res.status(503).json({ message: "Database is reactivating. Please try again in a moment." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify endpoint - verifies the signed challenge
  app.post("/api/login/verify", async (req, res) => {
    try {
      const { username, signature, nonce } = req.body;
      
      if (!username || !signature || !nonce) {
        return res.status(400).json({ message: "Username, signature, and nonce are required" });
      }

      // SECURITY FIX: Always return same error message to prevent username enumeration
      const GENERIC_ERROR = "Invalid credentials";

      // Check if challenge exists and is valid
      const challenge = challengeStore.get(username);
      let isValidChallenge = false;
      
      if (challenge && challenge.nonce === nonce && challenge.expiresAt >= Date.now()) {
        isValidChallenge = true;
        // Delete challenge immediately to prevent replay attacks
        challengeStore.delete(username);
      } else if (challenge) {
        // Delete invalid/expired challenge
        challengeStore.delete(username);
      }

      // Always get user and perform operations to maintain consistent timing
      const user = await storage.getUserByUsername(username);
      
      // Construct the message that would have been signed
      const message = `GBTC:Login:${username}:${nonce}`;
      
      // SECURITY FIX: Always perform signature verification to prevent timing attacks
      // Use dummy public key if user doesn't exist to maintain consistent timing
      const publicKeyToUse = user?.publicKey || '0'.repeat(64); // Dummy key for non-existent users
      const isValidSignature = await verifySignature(publicKeyToUse, message, signature);

      // All conditions must be true for successful login
      if (isValidChallenge && user && isValidSignature) {
        // SECURITY FIX: Regenerate session to prevent session fixation
        await new Promise<void>((resolve, reject) => {
          req.session.regenerate((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Set session
        req.session.userId = user.id;
        req.user = user;

        res.json(user);
      } else {
        // Always return the same generic error message
        return res.status(401).json({ message: GENERIC_ERROR });
      }
    } catch (error: any) {
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        return res.status(503).json({ message: "Database is reactivating. Please try again in a moment." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (!req.session?.userId || !req.user) {
      return res.sendStatus(401);
    }
    
    try {
      // Refresh user data from database in case of updates
      const freshUser = await storage.getUser(req.session.userId);
      if (freshUser) {
        req.user = freshUser;
        res.json(freshUser);
      } else {
        req.session.destroy(() => {});
        res.sendStatus(401);
      }
    } catch (error: any) {
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        // If database is reactivating, return cached user data
        res.json(req.user);
      } else {
        res.status(500).json({ message: "Database error" });
      }
    }
  });

  // Helper middleware to check if user is authenticated
  app.use('/api/*', (req, res, next) => {
    // Skip auth check for auth endpoints
    if (req.path.startsWith('/api/register') || 
        req.path.startsWith('/api/login') || 
        req.path === '/api/user') {
      return next();
    }
    
    if (!req.session?.userId || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    next();
  });
}