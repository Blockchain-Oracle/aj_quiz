import { db } from "@/server/db";
import { leaderboards, quizHistory, userStats } from "@/server/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function updateLeaderboards(userMap: Map<string, string>) {
  const periods = {
    weekly: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    monthly: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    allTime: {
      start: new Date(0),
      end: new Date(),
    },
  };

  for (const [period, { start, end }] of Object.entries(periods)) {
    // Get all subjects with recent activity
    const activeSubjects = await db
      .select({ subject: quizHistory.subject })
      .from(quizHistory)
      .where(gte(quizHistory.createdAt, start))
      .groupBy(quizHistory.subject);

    for (const { subject } of activeSubjects) {
      // Calculate rankings for each subject
      const rankings = await db
        .select({
          userId: quizHistory.userId,
          score: sql<number>`sum(${quizHistory.score})`,
          totalQuestions: sql<number>`sum(${quizHistory.totalQuestions})`,
          timeSpent: sql<number>`sum(${quizHistory.timeSpent})`,
          attempts: sql<number>`count(*)`,
        })
        .from(quizHistory)
        .where(
          and(
            eq(quizHistory.subject, subject),
            gte(quizHistory.createdAt, start),
          ),
        )
        .groupBy(quizHistory.userId)
        .orderBy(sql`sum(${quizHistory.score}) desc`);

      // Update leaderboard entries
      await db.transaction(async (tx) => {
        // Clear old entries
        await tx
          .delete(leaderboards)
          .where(
            and(
              eq(leaderboards.subject, subject),
              eq(leaderboards.period, period),
            ),
          );

        // Insert new entries
        await tx.insert(leaderboards).values(
          rankings.map((rank, index) => ({
            userId: rank.userId,
            username: userMap.get(rank.userId) ?? "Unknown User",
            subject,
            score: rank.score,
            totalQuestions: rank.totalQuestions,
            timeSpent: rank.timeSpent.toFixed(2),
            attempts: rank.attempts,
            period,
            periodStart: start,
            periodEnd: end,
            rank: index + 1,
            lastAttempt: new Date(),
          })),
        );

        // Update user stats with new rankings
        if (period === "weekly") {
          for (const [index, rank] of rankings.entries()) {
            await tx
              .update(userStats)
              .set({
                currentRank: index + 1,
                bestRank: sql`LEAST(COALESCE(best_rank, ${
                  index + 1
                }), ${index + 1})`,
                rankUpdatedAt: new Date(),
              })
              .where(eq(userStats.userId, rank.userId));
          }
        }
      });
    }
  }

  // Revalidate cache
  revalidateTag("leaderboard");
}
