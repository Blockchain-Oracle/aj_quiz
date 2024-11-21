import { db } from "@/server/db";
import { quizHistory, users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const globalLeaderboard = await db
      .select({
        userId: quizHistory.userId,
        username: users.username,
        totalQuizzes: sql<number>`COUNT(*)`,
        averageScore: sql<number>`ROUND(AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}), 1)`,
        totalTime: sql<number>`ROUND(SUM(${quizHistory.timeSpent}) / 3600.0, 1)`,
      })
      .from(quizHistory)
      .leftJoin(users, eq(users.id, quizHistory.userId))
      .groupBy(quizHistory.userId, users.username)
      .orderBy(
        sql`AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}) DESC`,
      )
      .limit(10);

    console.log(globalLeaderboard);
    return NextResponse.json(globalLeaderboard);
  } catch (error) {
    console.error("Failed to fetch global leaderboard:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
