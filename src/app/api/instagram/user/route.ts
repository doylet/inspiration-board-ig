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

    const { accessToken, userId } = session;
    logger.debug(CONTEXT, "Session validated, fetching user profile", { userId });

    // Fetch Instagram Business Account info
    const url = `https://graph.facebook.com/v18.0/${userId}?fields=id,username,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`;
    logger.debug(CONTEXT, "Calling Instagram API", { endpoint: userId });
    
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
      mediaCount: data.media_count,
    });

    // Add account_type for compatibility with existing UI
    return NextResponse.json({ ...data, account_type: "BUSINESS" });
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
