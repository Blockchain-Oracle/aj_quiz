import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { checkAndCreateUser } from "@/middleware/check-user";

export default async function SSOCallback() {
  await checkAndCreateUser();
  return <AuthenticateWithRedirectCallback />;
}
