import { cookies } from "next/headers";
import { db, User } from "./db";

const SESSION_COOKIE = "rc_session_user_id";

export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  return db.findUserById(userId);
}

export async function setCurrentUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export async function clearCurrentUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

