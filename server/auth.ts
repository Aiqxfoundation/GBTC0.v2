import { type Express } from "express";
import session from "express-session";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const asyncScrypt = promisify(scrypt);
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

// Generate unique access key in format GBTC-XXXXX-XXXXX-XXXXX-XXXXX
function generateUniqueAccessKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 4; i++) {
    let segment = '';
    const randomBytesBuffer = randomBytes(5); // 5 bytes for 5 chars
    for (let j = 0; j < 5; j++) {
      const randomIndex = randomBytesBuffer[j] % chars.length;
      segment += chars.charAt(randomIndex);
    }
    segments.push(segment);
  }
  
  return `GBTC-${segments.join('-')}`;
}

// Hash access key for secure storage
async function hashAccessKey(accessKey: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await asyncScrypt(accessKey, salt, 32) as Buffer;
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

// Verify access key against stored hash
async function verifyAccessKey(accessKey: string, hashedKey: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = hashedKey.split(':');
    if (!saltHex || !hashHex) return false;
    
    const salt = Buffer.from(saltHex, 'hex');
    const hash = await asyncScrypt(accessKey, salt, 32) as Buffer;
    return hash.toString('hex') === hashHex;
  } catch {
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

  // Registration endpoint - generates unique access key
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, referredBy } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      // Generate unique access key
      let accessKey: string;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Generate unique access key (no collision check needed due to large keyspace)
      accessKey = generateUniqueAccessKey();

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Generate unique hash-style referral code (8 characters, alphanumeric)
      const generateReferralCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        const codeBytes = randomBytes(6); // Use crypto for secure random generation
        let code = '';
        // Generate a more hash-like code with mixed case
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(codeBytes[i] % chars.length);
        }
        // Add timestamp component for uniqueness
        const timestamp = Date.now().toString(36).slice(-2).toUpperCase();
        return code + timestamp;
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

      // Hash the access key for secure storage
      const hashedAccessKey = await hashAccessKey(accessKey);
      
      const user = await storage.createUser({
        username,
        accessKey: hashedAccessKey,
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
      
      // Return user data with the plain access key (only time it's shown)
      res.status(201).json({ ...user, accessKey });
    } catch (error: any) {
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        return res.status(503).json({ message: "Database is reactivating. Please try again in a moment." });
      }
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('access_key')) {
          return res.status(400).json({ message: "This access key is already registered" });
        }
        return res.status(400).json({ message: "Username already exists" });
      }
      next(error);
    }
  });

  // Simple login endpoint - uses username and access key
  app.post("/api/login", async (req, res) => {
    try {
      const { username, accessKey } = req.body;
      
      if (!username || !accessKey) {
        return res.status(400).json({ message: "Username and access key are required" });
      }

      // SECURITY: Always return same error message to prevent username enumeration
      const GENERIC_ERROR = "Invalid credentials";

      // Get user and perform operations to maintain consistent timing
      const user = await storage.getUserByUsername(username);
      
      // SECURITY: Always perform access key verification to prevent timing attacks
      // Use dummy hash if user doesn't exist to maintain consistent timing
      const hashedKeyToUse = user?.accessKey || 'dummy:hash';
      const isValidAccessKey = await verifyAccessKey(accessKey, hashedKeyToUse);

      // Both conditions must be true for successful login
      if (user && isValidAccessKey) {
        // SECURITY: Regenerate session to prevent session fixation
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