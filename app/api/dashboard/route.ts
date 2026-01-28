import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/session";

export async function GET() {
  const user = await getCurrentUser();

  const greetingName = user?.name ?? "Athlete";
  const greetingHour = new Date().getHours();
  const greetingPrefix =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 18
      ? "Good afternoon"
      : "Good evening";

  const weeklyDistance = db.getWeeklyDistanceForUser(user?.id ?? null);
  const myChallenges = user ? db.getChallengesForUser(user.id) : [];

  const tips = db.getTrainingTips();

  return NextResponse.json({
    greeting: `${greetingPrefix}, ${greetingName}`,
    weeklyDistance,
    activeChallengesCount: myChallenges.length,
    myChallenges,
    tips
  });
}

