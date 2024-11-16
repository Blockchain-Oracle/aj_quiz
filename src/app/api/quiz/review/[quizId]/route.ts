import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
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

    const quizHistory = await db.query.quizHistory.findFirst({
      where: eq(quizHistory.id, parseInt(params.quizId)),
        userId,
      },
      include: {
        questions: {
          select: {
            question: true,
            userAnswer: true,
            correctAnswer: true,
            explanation: true,
            isCorrect: true,
          },
        },
      },
    });

    if (!quizHistory) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json({
      subject: quizHistory.subject,
      questions: quizHistory.questions,
      score: quizHistory.score,
      totalQuestions: quizHistory.totalQuestions,
      timeSpent: quizHistory.timeSpent,
      createdAt: quizHistory.createdAt,
    });
  } catch (error) {
    console.error("[QUIZ_REVIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
