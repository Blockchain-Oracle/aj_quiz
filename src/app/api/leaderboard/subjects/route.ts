import { db } from "@/server/db";
import { quizHistory, users } from "@/server/db/schema";
import { sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");

    if (!subject) {
      // Get top performers for each subject
      const subjectLeaderboards = await db
        .select({
          subject: quizHistory.subject,
          userId: quizHistory.userId,
          username: users.username,
          totalQuizzes: sql<number>`COUNT(*)`,
          averageScore: sql<number>`ROUND(AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}), 1)`,
          totalTime: sql<number>`ROUND(SUM(${quizHistory.timeSpent}) / 3600.0, 1)`,
        })
        .from(quizHistory)
        .leftJoin(users, eq(users.id, quizHistory.userId))
        .groupBy(quizHistory.subject, quizHistory.userId, users.username)
        .orderBy(
          quizHistory.subject,
          sql`AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}) DESC`,
        );

      // Group by subject and take top 10 for each
      interface LeaderboardEntry {
        subject: string;
        userId: string;
        username: string | null;
        totalQuizzes: number;
        averageScore: number;
        totalTime: number;
      }

      const leaderboardsBySubject: Record<string, LeaderboardEntry[]> = {};
      subjectLeaderboards.forEach((entry: LeaderboardEntry) => {
        const subject = entry.subject;
        if (!leaderboardsBySubject[subject]) {
          leaderboardsBySubject[subject] = [];
        }
        const subjectLeaderboard = leaderboardsBySubject[subject];
        if (subjectLeaderboard.length < 10) {
          subjectLeaderboard.push(entry);
        }
      });

      return NextResponse.json(leaderboardsBySubject);
    } else {
      // Get leaderboard for specific subject
      const subjectLeaderboard = await db
        .select({
          userId: quizHistory.userId,
          username: users.username,
          totalQuizzes: sql<number>`COUNT(*)`,
          averageScore: sql<number>`ROUND(AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}), 1)`,
          totalTime: sql<number>`ROUND(SUM(${quizHistory.timeSpent}) / 3600.0, 1)`,
        })
        .from(quizHistory)
        .leftJoin(users, eq(users.id, quizHistory.userId))
        .where(sql`LOWER(${quizHistory.subject}) = LOWER(${subject})`)
        .groupBy(quizHistory.userId, users.username)
        .orderBy(
          sql`AVG(${quizHistory.score} * 100.0 / ${quizHistory.totalQuestions}) DESC`,
        )
        .limit(10);

      // Wrap the response in an object with the subject as the key
      const response = {
        [subject]: subjectLeaderboard,
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Failed to fetch subject leaderboard:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
