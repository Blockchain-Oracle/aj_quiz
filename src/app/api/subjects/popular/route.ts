import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const popularSubjects = await db
      .select({
        name: quizHistory.subject,
        participants: sql<number>`COUNT(DISTINCT ${quizHistory.userId})`,
        averageScore: sql<number>`AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions})`,
      })
      .from(quizHistory)
      .groupBy(quizHistory.subject)
      .orderBy(sql`COUNT(DISTINCT ${quizHistory.userId}) DESC`)
      .limit(5);

    // Add trend based on recent activity (last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const subjectsWithTrend = await Promise.all(
      popularSubjects.map(async (subject) => {
        const [recentCount, previousCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(quizHistory)
            .where(
              sql`${quizHistory.subject} = ${subject.name} AND ${quizHistory.createdAt} >= ${lastWeek.toISOString()}`,
            ),
          db
            .select({ count: sql<number>`count(*)` })
            .from(quizHistory)
            .where(
              sql`${quizHistory.subject} = ${subject.name} AND ${quizHistory.createdAt} >= ${twoWeeksAgo.toISOString()} AND ${quizHistory.createdAt} < ${lastWeek.toISOString()}`,
            ),
        ]);

        const trend =
          recentCount[0]?.count &&
          recentCount[0].count > (previousCount[0]?.count ?? 0)
            ? "up"
            : recentCount[0]?.count &&
                recentCount[0].count < (previousCount[0]?.count ?? 0)
              ? "down"
              : "stable";

        return {
          ...subject,
          averageScore: Math.round(subject.averageScore),
          trend,
        };
      }),
    );

    return NextResponse.json(subjectsWithTrend);
  } catch (error) {
    console.error("Failed to fetch popular subjects:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
