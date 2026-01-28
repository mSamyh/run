import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json(
      { error: "Only athletes can join challenges" },
      { status: 403 }
    );
  }

  const challenge = db.getChallenge(id);
  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participant = db.joinChallenge(user.id, challenge.id);

  return NextResponse.json({ participant });
}

