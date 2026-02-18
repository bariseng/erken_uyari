import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        // Basit hash karşılaştırma (bcrypt sandbox'ta sorunlu olabilir)
        const { compareSync } = await import("bcryptjs");
        const valid = compareSync(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, tier: user.tier };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
    newUser: "/kayit",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = (user as any).tier || "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).tier = token.tier;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "geoforce-dev-secret-change-in-production",
};
