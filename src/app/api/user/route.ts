import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const { username, userId } = body as { username: string; userId: string };
    console.log(body);
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
