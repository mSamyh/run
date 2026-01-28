import { NextRequest, NextResponse } from "next/server";
import { db, Role } from "../../../../lib/db";
import { setCurrentUser } from "../../../../lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.email !== "string" || typeof body.name !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const name = body.name.trim();
  const role: Role = body.role === "admin" ? "admin" : "athlete";

  const existing = db.findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  // NOTE: For demo purposes we are not storing passwords.
  const user = db.createUser({
    email,
    name,
    role
  });

  await setCurrentUser(user.id);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}

