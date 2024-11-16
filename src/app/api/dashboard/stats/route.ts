import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Format dates for PostgreSQL
    const lastWeek = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Get total quizzes taken
    const totalQuizzes = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId));

    // Get quizzes taken last week
    const lastWeekQuizzes = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizHistory)
      .where(
        and(
          eq(quizHistory.userId, userId),
          sql`${quizHistory.createdAt}::timestamp >= ${lastWeek}::timestamp`,
        ),
      );

    // Get average score
    const averageScore = await db
      .select({
        average: sql<number>`avg(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions})`,
      })
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId));

    // Get total study time
    const totalStudyTime = await db
      .select({
        total: sql<number>`sum(${quizHistory.timeSpent})`,
      })
      .from(quizHistory)
      .where(
        and(
          eq(quizHistory.userId, userId),
          sql`${quizHistory.createdAt}::timestamp >= ${yesterday}::timestamp`,
        ),
      );

    // Calculate percentage changes
    const weekBeforeLast = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizHistory)
      .where(
        and(
          eq(quizHistory.userId, userId),
          sql`${quizHistory.createdAt}::timestamp >= ${twoWeeksAgo}::timestamp`,
          sql`${quizHistory.createdAt}::timestamp < ${lastWeek}::timestamp`,
        ),
      );

    const quizChange =
      weekBeforeLast[0]?.count && weekBeforeLast[0].count > 0
        ? ((lastWeekQuizzes[0]?.count ?? 0 - weekBeforeLast[0].count) /
            weekBeforeLast[0].count) *
          100
        : 0;

    return NextResponse.json({
      totalQuizzes: totalQuizzes[0]?.count ?? 0,
      quizzesLastWeek: lastWeekQuizzes[0]?.count ?? 0,
      quizChange: Math.round(quizChange),
      averageScore: Math.round(averageScore[0]?.average ?? 0),
      studyTime: Math.round(((totalStudyTime[0]?.total ?? 0) / 3600) * 10) / 10,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
