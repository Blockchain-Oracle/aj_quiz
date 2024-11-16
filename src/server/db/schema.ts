// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  text,
  json,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `aj_quiz_${name}`);

export const quizHistory = createTable(
  "quiz_history",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    timeSpent: decimal("time_spent").notNull(), // in minutes
    mode: varchar("mode", { length: 20 }).notNull(), // 'practice' or 'timed'
    answers: json("answers").$type<Record<number, string>>().notNull(), // store user answers
    completed: boolean("completed").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("quiz_history_user_id_idx").on(table.userId),
    subjectIdx: index("quiz_history_subject_idx").on(table.subject),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);

export const questionReports = createTable(
  "question_reports",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    questionId: integer("question_id").notNull(),
    message: text("message"),
    status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, reviewed, resolved
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    questionIdIdx: index("question_id_idx").on(table.questionId),
    statusIdx: index("status_idx").on(table.status),
  }),
);

export const userStats = createTable(
  "user_stats",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 256 }).unique().notNull(),
    totalQuizzes: integer("total_quizzes").default(0).notNull(),
    totalCorrect: integer("total_correct").default(0).notNull(),
    totalQuestions: integer("total_questions").default(0).notNull(),
    totalTimeSpent: decimal("total_time_spent", { precision: 10, scale: 2 })
      .default(sql`0`)
      .notNull(), // in minutes
    lastQuizDate: timestamp("last_quiz_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    currentRank: integer("current_rank"),
    bestRank: integer("best_rank"),
    rankUpdatedAt: timestamp("rank_updated_at", { withTimezone: true }),
    subject: varchar("subject", { length: 100 }).notNull(),
  },
  (table) => ({
    userIdIdx: index("user_stats_user_id_idx").on(table.userId),
    subjectIdx: index("user_stats_subject_idx").on(table.subject),
  }),
);

export const leaderboards = createTable(
  "leaderboards",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    username: varchar("username", { length: 100 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    timeSpent: decimal("time_spent").notNull(), // in minutes
    attempts: integer("attempts").default(0).notNull(),
    lastAttempt: timestamp("last_attempt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    period: varchar("period", { length: 20 }).notNull(), // weekly, monthly, all-time
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    rank: integer("rank").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    userIdIdx: index("leaderboard_user_id_idx").on(table.userId),
    subjectPeriodIdx: index("subject_period_idx").on(
      table.subject,
      table.period,
    ),
    rankIdx: index("rank_idx").on(table.rank),
  }),
);

export const users = createTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(), // Clerk user id
  username: varchar("username", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
