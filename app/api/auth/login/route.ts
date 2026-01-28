import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { setCurrentUser } from "../../../../lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const user = db.findUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Passwordless demo login – in real app, verify password.
  await setCurrentUser(user.id);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}

