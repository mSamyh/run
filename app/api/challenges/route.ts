import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/session";

export async function GET() {
  const challenges = db.listChallenges();

  const now = new Date();

  const payload = challenges.map((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    let status: "upcoming" | "active" | "completed" = "upcoming";
    if (now >= start && now <= end) status = "active";
    else if (now > end) status = "completed";

    const participants = db.getParticipantsForChallenge(c.id);

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      challengeType: c.challengeType,
      distance: c.distance ?? null,
      visibility: c.visibility,
      participantsCount: participants.length,
      status
    };
  });

  return NextResponse.json({ challenges: payload });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.title !== "string" ||
    typeof body.description !== "string" ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string" ||
    typeof body.challengeType !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const challenge = db.createChallenge({
    title: body.title.trim(),
    description: body.description.trim(),
    startDate: body.startDate,
    endDate: body.endDate,
    registrationDeadline:
      typeof body.registrationDeadline === "string"
        ? body.registrationDeadline
        : body.startDate,
    challengeType: body.challengeType,
    distance:
      typeof body.distance === "number" && body.distance > 0
        ? body.distance
        : undefined,
    time:
      typeof body.time === "number" && body.time > 0 ? body.time : undefined,
    frequency:
      typeof body.frequency === "string" ? body.frequency : undefined,
    rulesJson: body.rules ?? undefined,
    visibility: body.visibility === "private" ? "private" : "public",
    createdBy: user.id
  });

  return NextResponse.json({ challenge });
}

