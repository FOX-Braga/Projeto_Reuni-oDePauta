import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { needsSetup, sessionUser, cookieName } from "@/features/auth/service";
import { LoginForm } from "@/features/auth/login-form";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (sessionUser((await cookies()).get(cookieName)?.value)) redirect("/");
  return <LoginForm setup={needsSetup()} />;
}
