import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import * as ed25519 from "@noble/ed25519";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { sha512 } from "@noble/hashes/sha2";

// Required initialization for @noble/ed25519
(ed25519.etc as any).sha512Sync = (...m: Uint8Array[]) => sha512(ed25519.etc.concatBytes(...m));

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  challengeLoginMutation: UseMutationResult<SelectUser, Error, ChallengeLoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  getChallengeForLogin: (username: string) => Promise<{ nonce: string }>;
};

type ChallengeLoginData = {
  username: string;
  privateKey: string; // Will be used to sign the challenge
};

type RegisterData = {
  username: string;
  publicKey: string;
  referredBy?: string;
};

// Helper function to sign a message with Ed25519 private key
async function signMessage(privateKeyHex: string, message: string): Promise<string> {
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const messageBytes = new TextEncoder().encode(message);
    const signature = await ed25519.sign(messageBytes, privateKey);
    return bytesToHex(signature);
  } catch (error) {
    throw new Error('Failed to sign message. Please check your private key format.');
  }
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 60000,
    gcTime: 300000 // Cache user for better performance
  });

  // Function to get login challenge (nonce)
  const getChallengeForLogin = async (username: string): Promise<{ nonce: string }> => {
    const res = await apiRequest("POST", "/api/login/challenge", { username });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to get login challenge');
    }
    return await res.json();
  };

  const challengeLoginMutation = useMutation({
    mutationFn: async ({ username, privateKey }: ChallengeLoginData) => {
      // Step 1: Get challenge nonce
      const { nonce } = await getChallengeForLogin(username);
      
      // Step 2: Sign the challenge message
      const message = `GBTC:Login:${username}:${nonce}`;
      const signature = await signMessage(privateKey, message);
      
      // Step 3: Verify signature with server
      const res = await apiRequest("POST", "/api/login/verify", {
        username,
        signature,
        nonce
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Redirect to mining page after successful login
      setLocation("/mining");
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Redirect to mining page after successful registration
      setLocation("/mining");
      toast({
        title: "Account created successfully",
        description: `Welcome to GBTC Mining, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        challengeLoginMutation,
        logoutMutation,
        registerMutation,
        getChallengeForLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Utility function to generate Ed25519 keypair
export async function generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
  const privateKeyBytes = ed25519.utils.randomSecretKey();
  const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);
  
  return {
    publicKey: bytesToHex(publicKeyBytes),
    privateKey: bytesToHex(privateKeyBytes)
  };
}

// Utility function to validate private key format
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    return /^[a-fA-F0-9]{64}$/.test(privateKey);
  } catch {
    return false;
  }
}

// Utility function to validate public key format
export function isValidPublicKey(publicKey: string): boolean {
  try {
    return /^[a-fA-F0-9]{64}$/.test(publicKey);
  } catch {
    return false;
  }
}