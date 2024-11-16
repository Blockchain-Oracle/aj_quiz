import { MetricsService } from "@/services/MetricsService";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface QuizCompleteBody {
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<number, string>;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as QuizCompleteBody;
    const { subject, score, totalQuestions, timeSpent, answers } = body;

    // Use MetricsService to handle both quiz history and stats update
    const result = await MetricsService.updateQuizMetrics(
      userId,
      subject,
      score,
      totalQuestions,
      timeSpent,
      answers,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to complete quiz:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
