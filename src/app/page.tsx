import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE, parseAuthSession } from "@/lib/auth/otp";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  const session = await parseAuthSession(sessionToken);

  if (session) {
    redirect("/apply");
  }

  redirect("/login");
}
