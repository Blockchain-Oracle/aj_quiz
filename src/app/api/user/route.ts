import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const { username } = body as { username: string };

    await db
      .insert(users)
      .values({
        id: userId,
        username,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { username, updatedAt: new Date() },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
