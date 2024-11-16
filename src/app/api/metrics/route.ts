import { MetricsService } from "@/services/MetricsService";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");

    const stats = await MetricsService.getUserStats(
      userId,
      subject ?? undefined,
    );

    console.log(stats);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
