import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

const CONTEXT = "API:Instagram:Media";

export async function GET() {
  logger.info(CONTEXT, "GET request received");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      logger.warn(CONTEXT, "Unauthorized access attempt", {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { accessToken } = session;
    logger.debug(CONTEXT, "Session validated, fetching media", {
      userId: session.userId,
    });

    // Fetch user's media (posts)
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&access_token=${accessToken}`;
    logger.debug(CONTEXT, "Calling Instagram API", { endpoint: "me/media" });
    
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      logger.error(CONTEXT, "Instagram API error", {
        status: response.status,
        error: error,
      });
      return NextResponse.json(
        { error: error.error?.message || "Failed to fetch media" },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info(CONTEXT, "Successfully fetched media", {
      mediaCount: data.data?.length || 0,
      hasNextPage: !!data.paging?.next,
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
