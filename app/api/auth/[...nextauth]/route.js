import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for session handling
    maxAge: 60 * 60 * 24, // Session expiration: 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach the user's email to the token
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach email and isAdmin flag to the session object
      if (token) {
        session.user.email = token.email;
        session.user.isAdmin = token.email === process.env.ADMIN_EMAIL; // Check if email matches admin
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
