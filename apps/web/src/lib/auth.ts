import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    tier?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tier?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: string;
  }
}

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const LOGIN_RATE_LIMIT = 5; // 5 attempts per minute
const LOGIN_WINDOW = 60 * 1000; // 1 minute

function checkLoginRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  
  if (!entry || entry.resetTime < now) {
    loginAttempts.set(email, { count: 1, resetTime: now + LOGIN_WINDOW });
    return { allowed: true, remaining: LOGIN_RATE_LIMIT - 1 };
  }
  
  if (entry.count >= LOGIN_RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: LOGIN_RATE_LIMIT - entry.count };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email", placeholder: "ornek@mail.com" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit check for login attempts
        const rateCheck = checkLoginRateLimit(credentials.email);
        if (!rateCheck.allowed) {
          throw new Error("Çok fazla giriş denemesi. Lütfen bir dakika bekleyip tekrar deneyin.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const { compareSync } = await import("bcryptjs");
        const valid = compareSync(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, tier: user.tier };
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: "/giris",
    newUser: "/kayit",
    error: "/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier || "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.tier = token.tier;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET environment variable must be set in production");
    }
    return "geoforce-dev-secret-change-in-production";
  })(),
};
