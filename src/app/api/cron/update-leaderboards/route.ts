import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { updateLeaderboards } from "@/server/jobs/updateLeaderboards";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get all users first
    const userRecords = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users);

    // Create a map for quick lookup
    const userMap = new Map(
      userRecords.map((user) => [user.id, user.username]),
    );

    // Pass the userMap to updateLeaderboards
    await updateLeaderboards(userMap);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboards" },
      { status: 500 },
    );
  }
}
