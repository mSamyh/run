import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const challenge = db.getChallenge(params.id);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participants = db.getParticipantsForChallenge(challenge.id);
  const now = new Date();
  const start = new Date(challenge.startDate);
  const end = new Date(challenge.endDate);
  let status: "upcoming" | "active" | "completed" = "upcoming";
  if (now >= start && now <= end) status = "active";
  else if (now > end) status = "completed";

  return NextResponse.json({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    registrationDeadline: challenge.registrationDeadline,
    challengeType: challenge.challengeType,
    distance: challenge.distance ?? null,
    time: challenge.time ?? null,
    frequency: challenge.frequency ?? null,
    rules: challenge.rulesJson ?? null,
    visibility: challenge.visibility,
    createdBy: challenge.createdBy,
    participantsCount: participants.length,
    status
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const challenge = db.getChallenge(params.id);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.challenges = db.challenges.filter((c) => c.id !== challenge.id);
  db.participants = db.participants.filter(
    (p) => p.challengeId !== challenge.id
  );
  db.runs = db.runs.filter((r) => r.challengeId !== challenge.id);
  db.leaderboards = db.leaderboards.filter(
    (row) => row.challengeId !== challenge.id
  );

  return NextResponse.json({ ok: true });
}

