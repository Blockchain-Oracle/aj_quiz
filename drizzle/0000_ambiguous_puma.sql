CREATE TABLE IF NOT EXISTS "aj_quiz_leaderboards" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "aj_quiz_leaderboards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(256) NOT NULL,
	"username" varchar(100) NOT NULL,
	"subject" varchar(100) NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"time_spent" numeric NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aj_quiz_question_reports" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "aj_quiz_question_reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(256) NOT NULL,
	"subject" varchar(100) NOT NULL,
	"question_id" integer NOT NULL,
	"message" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aj_quiz_quiz_history" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "aj_quiz_quiz_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(256) NOT NULL,
	"subject" varchar(100) NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"time_spent" numeric NOT NULL,
	"mode" varchar(20) NOT NULL,
	"answers" json NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aj_quiz_user_stats" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "aj_quiz_user_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(256) NOT NULL,
	"total_quizzes" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"total_time_spent" numeric(10, 2) DEFAULT 0 NOT NULL,
	"last_quiz_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"current_rank" integer,
	"best_rank" integer,
	"rank_updated_at" timestamp with time zone,
	"subject" varchar(100) NOT NULL,
	CONSTRAINT "aj_quiz_user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aj_quiz_users" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leaderboard_user_id_idx" ON "aj_quiz_leaderboards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subject_period_idx" ON "aj_quiz_leaderboards" USING btree ("subject","period");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rank_idx" ON "aj_quiz_leaderboards" USING btree ("rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_id_idx" ON "aj_quiz_question_reports" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_idx" ON "aj_quiz_question_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_history_user_id_idx" ON "aj_quiz_quiz_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_history_subject_idx" ON "aj_quiz_quiz_history" USING btree ("subject");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "aj_quiz_quiz_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_stats_user_id_idx" ON "aj_quiz_user_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_stats_subject_idx" ON "aj_quiz_user_stats" USING btree ("subject");