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
      const normalizedKey = stat.subject.toLowerCase().trim();

      statsRecord[normalizedKey] = {
        name: stat.subject,
        quizzesTaken: Number(stat.quizzesTaken),
        averageScore: Math.round(Number(stat.averageScore) * 10) / 10 || 0,
        totalTime: Math.round((Number(stat.totalTime) / 3600) * 10) / 10 || 0,
        lastAttempt: stat.lastAttempt,
      };
    });
    console.log(statsRecord);

    return NextResponse.json(statsRecord);
  } catch (error) {
    console.error("Failed to fetch quiz stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
