import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function checkAndCreateUser() {
  const user = await currentUser();
  if (!user) return null;

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!existingUser) {
    // Create new user if they don't exist
    await db.insert(users).values({
      id: user.id,
      username:
        `${user.firstName} ${user.lastName}`.trim() ??
        user.username ??
        "Anonymous",
    });
  }

  return user.id;
}
