import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, sessionUser, needsSetup } from "@/features/auth/service";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  if (needsSetup()) redirect("/login");
  const user = sessionUser((await cookies()).get(cookieName)?.value);
  if (!user) redirect("/login");
  return <Shell user={{ ...user }}>{children}</Shell>;
}
