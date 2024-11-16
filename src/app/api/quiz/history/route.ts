import { db } from "@/server/db";
import { quizHistory } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const history = await db
      .select()
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId))
      .orderBy(quizHistory.createdAt);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch quiz history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = await db.insert(quizHistory).values({
      userId,
      ...body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
