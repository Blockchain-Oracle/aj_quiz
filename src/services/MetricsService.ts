import { db } from "@/server/db";
import { quizHistory, userStats } from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";

export class MetricsService {
  static async updateQuizMetrics(
    userId: string,
    subject: string,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    answers: Record<number, string>,
  ) {
    return await db.transaction(async (tx) => {
      // 1. Check for existing quiz history
      const existingQuiz = await tx
        .select()
        .from(quizHistory)
        .where(
          and(
            eq(quizHistory.userId, userId),
            eq(quizHistory.subject, subject),
            eq(quizHistory.completed, false),
          ),
        )
        .limit(1);

      let quizResult;

      if (existingQuiz.length > 0) {
        // Update existing quiz
        [quizResult] = await tx
          .update(quizHistory)
          .set({
            score: score,
            timeSpent: timeSpent.toFixed(2),
            answers: answers,
            completed: true,
          })
          .where(eq(quizHistory.id, existingQuiz[0]!.id))
          .returning();
      } else {
        // Insert new quiz
        [quizResult] = await tx
          .insert(quizHistory)
          .values({
            userId: userId,
            subject: subject,
            score: score,
            totalQuestions: totalQuestions,
            timeSpent: timeSpent.toFixed(2),
            mode: "practice",
            answers,
            completed: true,
          })
          .returning();
      }

      // 2. Update or create user stats
      await tx
        .insert(userStats)
        .values({
          userId: userId,
          subject: subject,
          totalQuizzes: 1,
          totalQuestions: totalQuestions,
          totalCorrect: score,
          totalTimeSpent: timeSpent.toFixed(2),
          lastQuizDate: new Date(),
        })
        .onConflictDoUpdate({
          target: [userStats.userId, userStats.subject],
          set: {
            totalQuizzes: sql`${userStats.totalQuizzes} + 1`,
            totalQuestions: sql`${userStats.totalQuestions} + ${totalQuestions}`,
            totalCorrect: sql`${userStats.totalCorrect} + ${score}`,
            totalTimeSpent: sql`${userStats.totalTimeSpent} + ${parseFloat(timeSpent.toFixed(2))}`,
            lastQuizDate: new Date(),
          },
        });

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
