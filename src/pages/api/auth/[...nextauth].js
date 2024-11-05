// src/pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";

export const authOptions = {
  providers: [
    // Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "john_doe" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Connect to database
        await dbConnect();

        // Find user by username
        const user = await User.findOne({ username: credentials.username });

        if (!user) {
          throw new Error("No user found with the given username");
        }

        // Check if password is correct
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user object
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role, // Include role
        };
      },
    }),
    // Additional providers can be added here
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID and role to session
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role; // Add role to token
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // Add more custom pages if needed
  },
};

export default NextAuth(authOptions);