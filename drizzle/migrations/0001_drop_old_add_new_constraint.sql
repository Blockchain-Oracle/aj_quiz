-- Drop the old constraint
ALTER TABLE "aj_quiz_user_stats" DROP CONSTRAINT "aj_quiz_user_stats_user_id_unique";

-- Add new composite unique constraint
ALTER TABLE "aj_quiz_user_stats" 
ADD CONSTRAINT "user_subject_unique_idx" UNIQUE ("user_id", "subject");

-- Verify the new constraint
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'aj_quiz_user_stats' AND constraint_type = 'UNIQUE';

ALTER TABLE "aj_quiz_user_stats" ADD CONSTRAINT user_subject_unique_idx UNIQUE (user_id, subject);
