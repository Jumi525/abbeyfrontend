import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

type CredentialsTypes = {
  email?: string;
  password?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as CredentialsTypes;
        if (!email || !password)
          throw new Error("Email and password are required.");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data) return null;
        return data as User;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token = { ...token, ...user };
        if (account?.provider === "google" && profile?.email) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name || profile.login,
                profilePhoto: profile.picture,
                method: "provider",
              }),
            }
          );

          if (res.ok) {
            const dbUser = await res.json();
            token = { ...token, ...dbUser };
          } else {
            console.error("Google login failed:", await res.text());
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session && token.user) {
        session = {
          ...session,
          ...token,
        };
      }
      console.log(session, "session");
      return session;
    },
  },

  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: { signIn: "/" },
});
