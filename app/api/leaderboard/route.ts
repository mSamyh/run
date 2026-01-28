import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");
  if (!challengeId) {
    return NextResponse.json(
      { error: "challengeId is required" },
      { status: 400 }
    );
  }

  const challenge = db.getChallenge(challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const leaderboard = db.getLeaderboard(challengeId);
  const currentUser = await getCurrentUser();

  const rows = leaderboard.map((row) => {
    const user = db.findUserById(row.userId);
    return {
      rank: row.rank,
      userId: row.userId,
      name: user?.name ?? "Unknown",
      country: user?.country ?? null,
      totalDistance: row.totalDistance,
      totalTime: row.totalTime
    };
  });

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      title: challenge.title
    },
    rows,
    currentUserId: currentUser?.id ?? null
  });
}

