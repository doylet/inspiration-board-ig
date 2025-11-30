"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstagramMedia, InstagramUser } from "@/types/instagram";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<InstagramUser | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Dashboard] Session status changed:", status);
    if (status === "unauthenticated") {
      console.log("[Dashboard] User unauthenticated, redirecting to home");
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("[Dashboard] User authenticated, fetching data");
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    console.log("[Dashboard] Starting data fetch");
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      console.log("[Dashboard] Fetching user profile...");
      const userResponse = await fetch("/api/instagram/user");
      console.log("[Dashboard] User profile response status:", userResponse.status);
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("[Dashboard] Failed to fetch user data:", errorData);
        throw new Error(errorData.error || "Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      console.log("[Dashboard] User profile fetched:", {
        username: userData.username,
        accountType: userData.account_type,
      });
      setUser(userData);

      // Fetch media
      console.log("[Dashboard] Fetching media...");
      const mediaResponse = await fetch("/api/instagram/media");
      console.log("[Dashboard] Media response status:", mediaResponse.status);
      
      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        console.error("[Dashboard] Failed to fetch media:", errorData);
        throw new Error(errorData.error || "Failed to fetch media");
      }
      
      const mediaData = await mediaResponse.json();
      console.log("[Dashboard] Media fetched:", {
        count: mediaData.data?.length || 0,
        hasNextPage: !!mediaData.paging?.next,
      });
      setMedia(mediaData.data || []);
    } catch (err) {
      console.error("[Dashboard] Error in fetchData:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      console.log("[Dashboard] Data fetch completed");
    }
  };

  const handleDownload = async (mediaUrl: string, mediaId: string) => {
    console.log("[Dashboard] Starting download:", { mediaId });
    try {
      const response = await fetch(
        `/api/instagram/download?url=${encodeURIComponent(mediaUrl)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Dashboard] Download failed:", errorData);
        throw new Error(errorData.error || "Failed to download image");
      }

      console.log("[Dashboard] Download successful, creating blob...");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `instagram_${mediaId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log("[Dashboard] Download completed:", { mediaId });
    } catch (err) {
      console.error("[Dashboard] Download error:", err);
      alert("Failed to download image: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Instagram media...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Inspiration Board
              </h1>
              {user && (
                <p className="text-sm text-gray-600">@{user.username}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Account Info
            </h2>
            <div className="flex gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Account Type:</span>{" "}
                {user.account_type}
              </div>
              <div>
                <span className="font-medium">Total Posts:</span>{" "}
                {user.media_count}
              </div>
            </div>
          </div>
        )}

        {media.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No media found on your account.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Instagram Media ({media.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-square">
                    <img
                      src={
                        item.media_type === "VIDEO"
                          ? item.thumbnail_url
                          : item.media_url
                      }
                      alt={item.caption || "Instagram post"}
                      className="w-full h-full object-cover"
                    />
                    {item.media_type === "VIDEO" && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        VIDEO
                      </div>
                    )}
                    {item.media_type === "CAROUSEL_ALBUM" && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        ALBUM
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {item.caption && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDownload(
                            item.media_type === "VIDEO"
                              ? item.thumbnail_url || item.media_url
                              : item.media_url,
                            item.id
                          )
                        }
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all"
                      >
                        Download
                      </button>
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
