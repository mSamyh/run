import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalDistance = db.runs
    .filter((r) => r.userId === user.id)
    .reduce((sum, r) => sum + r.distance, 0);

  const lastRun = db.runs
    .filter((r) => r.userId === user.id)
    .sort((a, b) => b.runDate.getTime() - a.runDate.getTime())[0];

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
      ageGroup: user.ageGroup ?? null,
      country: user.country ?? null,
      club: user.club ?? null,
      stravaConnected: Boolean(user.stravaUserId)
    },
    stats: {
      totalDistance,
      lastRunAt: lastRun?.runDate.toISOString() ?? null
    }
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (typeof body.name === "string") user.name = body.name.trim();
  if (typeof body.country === "string") user.country = body.country.trim();
  if (typeof body.club === "string") user.club = body.club.trim();
  if (typeof body.ageGroup === "string") user.ageGroup = body.ageGroup.trim();

  return NextResponse.json({ ok: true });
}

