import NextAuth, { NextAuthOptions } from "next-auth";
import { logger } from "@/lib/logger";

const CONTEXT = "NextAuth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://api.instagram.com/oauth/authorize",
        params: {
          scope: "user_profile,user_media",
          response_type: "code",
        },
      },
      token: "https://api.instagram.com/oauth/access_token",
      userinfo: {
        url: "https://graph.instagram.com/me",
        async request({ tokens }) {
          logger.debug(CONTEXT, "Fetching user info with access token");
          const url = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokens.access_token}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (!response.ok) {
            logger.error(CONTEXT, "Failed to fetch user info", {
              status: response.status,
              error: data,
            });
          } else {
            logger.info(CONTEXT, "Successfully fetched user info", {
              userId: data.id,
              username: data.username,
              accountType: data.account_type,
            });
          }
          
          return data;
        },
      },
      clientId: process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.INSTAGRAM_APP_SECRET!,
      profile(profile) {
        logger.debug(CONTEXT, "Processing profile", { profileId: profile.id });
        return {
          id: profile.id,
          name: profile.username,
          email: null,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        logger.info(CONTEXT, "JWT callback - New account connected", {
          provider: account.provider,
          userId: profile?.id,
        });
        token.accessToken = account.access_token;
        token.userId = profile?.id;
      } else {
        logger.debug(CONTEXT, "JWT callback - Existing token");
      }
      return token;
    },
    async session({ session, token }) {
      logger.debug(CONTEXT, "Session callback", {
        hasAccessToken: !!token.accessToken,
        userId: token.userId,
      });
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
