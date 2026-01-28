import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.challengeId !== "string" ||
    typeof body.distance !== "number" ||
    typeof body.duration !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const challenge = db.getChallenge(body.challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const pace =
    body.distance > 0 ? body.duration / body.distance : body.duration;

  const run = db.addRun({
    userId: user.id,
    challengeId: challenge.id,
    distance: body.distance,
    duration: body.duration,
    pace,
    runDate: body.runDate ? new Date(body.runDate) : new Date(),
    verified: true
  });

  return NextResponse.json({ run });
}

