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
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: {
          scope: "instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement",
          response_type: "code",
        },
      },
      token: {
        url: "https://graph.facebook.com/v18.0/oauth/access_token",
        async request({ params, provider }) {
          logger.debug(CONTEXT, "Requesting access token");
          const response = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${provider.clientId}&client_secret=${provider.clientSecret}&code=${params.code}&redirect_uri=${params.redirect_uri}`
          );
          const tokens = await response.json();
          logger.info(CONTEXT, "Received access token");
          return { tokens };
        },
      },
      userinfo: {
        url: "https://graph.facebook.com/v18.0/me",
        async request({ tokens }) {
          logger.debug(CONTEXT, "Fetching user info");
          
          // Get Facebook user and their pages
          const meResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${tokens.access_token}`
          );
          const meData = await meResponse.json();
          
          // Get Instagram Business Account connected to their page
          const accountsResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${tokens.access_token}`
          );
          const accountsData = await accountsResponse.json();
          
          const igAccount = accountsData.data?.[0]?.instagram_business_account;
          
          if (!igAccount) {
            logger.error(CONTEXT, "No Instagram Business Account found");
            throw new Error("No Instagram Business Account connected");
          }
          
          logger.info(CONTEXT, "Successfully fetched Instagram account", {
            igUserId: igAccount.id,
            username: igAccount.username,
          });
          
          return {
            id: igAccount.id,
            username: igAccount.username,
            name: igAccount.username,
            picture: igAccount.profile_picture_url,
          };
        },
      },
      clientId: process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.INSTAGRAM_APP_SECRET!,
      profile(profile) {
        logger.debug(CONTEXT, "Processing profile", { profileId: profile.id });
        return {
          id: profile.id,
          name: profile.username || profile.name,
          email: null,
          image: profile.picture || null,
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
