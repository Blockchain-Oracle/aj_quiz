import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get stats grouped by subject
    const subjectStats = await db
      .select({
        subject: quizHistory.subject,
        quizzesTaken: sql<number>`COUNT(*)`,
        averageScore: sql<number>`AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions})`,
        totalTime: sql<number>`SUM(${quizHistory.timeSpent})`,
        lastAttempt: sql<string>`MAX(${quizHistory.createdAt})`,
      })
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId))
      .groupBy(quizHistory.subject);

    // Transform into record format expected by the frontend
    const statsRecord: Record<
      string,
      {
        name: string;
        quizzesTaken: number;
        averageScore: number;
        totalTime: number;
        lastAttempt?: string;
      }
    > = {};

    subjectStats.forEach((stat) => {
      statsRecord[stat.subject.toLowerCase()] = {
        name: stat.subject,
        quizzesTaken: Number(stat.quizzesTaken),
        averageScore: Number(stat.averageScore) || 0,
        totalTime: Number(stat.totalTime) || 0,
        lastAttempt: stat.lastAttempt,
      };
    });

    return NextResponse.json(statsRecord);
  } catch (error) {
    console.error("Failed to fetch quiz stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
