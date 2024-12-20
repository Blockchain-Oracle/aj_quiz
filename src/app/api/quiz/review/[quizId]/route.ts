import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await db.query.quizHistory.findFirst({
      where: and(
        eq(quizHistory.id, parseInt(params.quizId)),
        eq(quizHistory.userId, userId)
      ),
      with: {
        questions: true
      }
    });

    if (!result) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json({
      subject: result.subject,
      questions: result.questions,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent,
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.error("[QUIZ_REVIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
