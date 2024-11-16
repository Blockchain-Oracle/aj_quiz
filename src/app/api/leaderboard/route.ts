import { db } from "@/server/db";
import { leaderboards } from "@/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const CACHE_TAG = "leaderboard";
const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

// Cache wrapper for leaderboard queries
const getCachedLeaderboard = unstable_cache(
  async (subject: string, period: string) => {
    try {
      let query = db
        .select()
        .from(leaderboards)
        .orderBy(desc(leaderboards.score))
        .limit(100);

      // Only filter by subject if not "all"
      if (subject !== "all") {
        query = query.where(
          and(
            eq(leaderboards.subject, subject),
            eq(leaderboards.period, period),
          ),
        );
      } else {
        query = query.where(eq(leaderboards.period, period));
      }

      const data = await query;

      if (!data.length) {
        return []; // Return empty array instead of throwing
      }

      return data;
    } catch (error) {
      console.error("Database query failed:", error);
      throw new Error("Failed to fetch leaderboard data");
    }
  },
  [`${CACHE_TAG}-get`],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAG],
  },
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject") ?? "all";
    const period = searchParams.get("period") ?? "weekly";

    const data = await getCachedLeaderboard(subject, period);

    return NextResponse.json({
      success: true,
      data,
      period,
      subject,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
