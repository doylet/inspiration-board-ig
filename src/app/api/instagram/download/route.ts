import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

const CONTEXT = "API:Instagram:Download";

export async function GET(request: NextRequest) {
  logger.info(CONTEXT, "GET request received");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      logger.warn(CONTEXT, "Unauthorized download attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const mediaUrl = searchParams.get("url");

    if (!mediaUrl) {
      logger.warn(CONTEXT, "Missing media URL parameter");
      return NextResponse.json(
        { error: "Media URL is required" },
        { status: 400 }
      );
    }

    logger.debug(CONTEXT, "Downloading media", {
      userId: session.userId,
      mediaUrl: mediaUrl.substring(0, 50) + "...",
    });

    // Fetch the image from Instagram
    const response = await fetch(mediaUrl);

    if (!response.ok) {
      logger.error(CONTEXT, "Failed to fetch media from Instagram", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: "Failed to download image" },
        { status: response.status }
      );
    }

    // Get the image data
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Generate a filename
    const extension = contentType.split("/")[1] || "jpg";
    const filename = `instagram_${Date.now()}.${extension}`;

    logger.info(CONTEXT, "Successfully downloaded media", {
      contentType,
      size: buffer.length,
      filename,
    });

    // Return the image with proper headers for download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
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
