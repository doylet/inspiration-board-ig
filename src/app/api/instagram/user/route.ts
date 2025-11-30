import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

const CONTEXT = "API:Instagram:User";

export async function GET() {
  logger.info(CONTEXT, "GET request received");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      logger.warn(CONTEXT, "Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { accessToken } = session;
    logger.debug(CONTEXT, "Session validated, fetching user profile");

    // Fetch user profile information
    const url = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`;
    logger.debug(CONTEXT, "Calling Instagram API", { endpoint: "me" });
    
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      logger.error(CONTEXT, "Instagram API error", {
        status: response.status,
        error: error,
      });
      return NextResponse.json(
        { error: error.error?.message || "Failed to fetch user data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info(CONTEXT, "Successfully fetched user profile", {
      userId: data.id,
      username: data.username,
      accountType: data.account_type,
      mediaCount: data.media_count,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error(CONTEXT, "Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
