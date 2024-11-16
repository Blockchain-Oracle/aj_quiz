import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get recent activities
    const recentActivities = await db
      .select({
        id: quizHistory.id,
        subject: quizHistory.subject,
        score: quizHistory.score,
        totalQuestions: quizHistory.totalQuestions,
        timeSpent: quizHistory.timeSpent,
        createdAt: quizHistory.createdAt,
      })
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId))
      .orderBy(desc(quizHistory.createdAt))
      .limit(5);

    // Transform into the format expected by the frontend
    const activities = recentActivities.map((activity) => ({
      id: String(activity.id),
      type: "quiz" as const,
      subject: activity.subject,
      score: activity.score,
      totalQuestions: activity.totalQuestions,
      timeSpent: activity.timeSpent,
      createdAt: activity.createdAt,
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
