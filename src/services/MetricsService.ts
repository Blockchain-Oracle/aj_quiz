import { db } from "@/server/db";
import { quizHistory, userStats } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export class MetricsService {
  static async updateQuizMetrics(
    userId: string,
    subject: string,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    answers: Record<number, string>,
  ) {
    // Begin transaction
    return await db.transaction(async (tx) => {
      // 1. Save quiz history
      const [quizResult] = await tx
        .insert(quizHistory)
        .values({
          userId: userId,
          subject: subject,
          score: score,
          totalQuestions: totalQuestions,
          timeSpent: timeSpent.toFixed(2),
          mode: "practice", // Add required mode field
          answers,
          completed: true, // Add completed field with default value
        })
        .returning();

      // 2. Update or create user stats
      const existingStats = await tx
        .select()
        .from(userStats)
        .where(
          and(eq(userStats.userId, userId), eq(userStats?.subject, subject)),
        )
        .limit(1);

      if (existingStats.length > 0) {
        const stats = existingStats[0] ?? {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalTimeSpent: 0,
          averageAccuracy: 0,
        };
        await tx
          .update(userStats)
          .set({
            totalQuizzes: stats.totalQuizzes + 1,
            totalQuestions: Number(stats.totalQuestions) + totalQuestions,
            totalCorrect: Number(stats.totalCorrect) + score,
            totalTimeSpent: (Number(stats.totalTimeSpent) + timeSpent).toFixed(
              2,
            ),
          })
          .where(
            and(eq(userStats.userId, userId), eq(userStats.subject, subject)),
          );
      } else {
        await tx.insert(userStats).values({
          userId: userId,
          subject: subject,
          totalQuizzes: 1,
          totalQuestions: totalQuestions,
          totalCorrect: score,
          totalTimeSpent: timeSpent.toFixed(2),
          lastQuizDate: new Date(),
        });
      }

      return quizResult;
    });
  }

  static async getUserStats(userId: string, subject?: string) {
    const conditions = subject
      ? and(eq(userStats.userId, userId), eq(userStats.subject, subject))
      : eq(userStats.userId, userId);

    return await db.select().from(userStats).where(conditions);
  }
}
