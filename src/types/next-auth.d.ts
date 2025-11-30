import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    userId: string;
  }

  interface Profile {
    id: string;
    username?: string;
    account_type?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
  }
}
