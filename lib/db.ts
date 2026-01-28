// Simple in-memory store to act as the single source of truth.
// This is intentionally free of hardcoded records; everything is created via API calls.

export type Role = "admin" | "athlete";

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar?: string;
  gender?: string;
  ageGroup?: string;
  country?: string;
  club?: string;
  stravaUserId?: string;
  createdAt: Date;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  challengeType: string;
  distance?: number;
  time?: number;
  frequency?: string;
  rulesJson?: unknown;
  visibility: "public" | "private";
  createdBy: string;
};

export type ChallengeParticipant = {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: Date;
  status: "active" | "completed" | "disqualified";
};

export type Run = {
  id: string;
  userId: string;
  challengeId: string;
  stravaActivityId?: string;
  distance: number;
  duration: number;
  pace: number;
  runDate: Date;
  verified: boolean;
};

export type LeaderboardRow = {
  challengeId: string;
  userId: string;
  totalDistance: number;
  totalTime: number;
  rank: number;
  updatedAt: Date;
};

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class InMemoryDB {
  users: User[] = [];
  challenges: Challenge[] = [];
  participants: ChallengeParticipant[] = [];
  runs: Run[] = [];
  leaderboards: LeaderboardRow[] = [];

  // User operations
  createUser(data: Omit<User, "id" | "createdAt">): User {
    const user: User = {
      ...data,
      id: createId(),
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string | null): User | undefined {
    if (!id) return undefined;
    return this.users.find((u) => u.id === id);
  }

  // Challenge operations
  createChallenge(data: Omit<Challenge, "id">): Challenge {
    const challenge: Challenge = {
      ...data,
      id: createId()
    };
    this.challenges.push(challenge);
    return challenge;
  }

  listChallenges(): Challenge[] {
    return [...this.challenges];
  }

  getChallenge(id: string): Challenge | undefined {
    return this.challenges.find((c) => c.id === id);
  }

  // Participant operations
  joinChallenge(userId: string, challengeId: string): ChallengeParticipant {
    const existing = this.participants.find(
      (p) => p.userId === userId && p.challengeId === challengeId
    );
    if (existing) return existing;

    const participant: ChallengeParticipant = {
      id: createId(),
      userId,
      challengeId,
      joinedAt: new Date(),
      status: "active"
    };
    this.participants.push(participant);
    return participant;
  }

  getParticipantsForChallenge(challengeId: string): ChallengeParticipant[] {
    return this.participants.filter((p) => p.challengeId === challengeId);
  }

  // Run operations
  addRun(data: Omit<Run, "id">): Run {
    const run: Run = {
      ...data,
      id: createId()
    };
    this.runs.push(run);
    this.recalculateLeaderboardForChallenge(run.challengeId);
    return run;
  }

  getWeeklyDistanceForUser(userId: string | null): number {
    if (!userId) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.runs
      .filter((r) => r.userId === userId && r.runDate >= oneWeekAgo)
      .reduce((sum, r) => sum + r.distance, 0);
  }

  getChallengesForUser(userId: string): {
    id: string;
    title: string;
    progressPercent: number;
    daysRemaining: number;
  }[] {
    const now = new Date();
    const participantChallengeIds = this.participants
      .filter((p) => p.userId === userId && p.status === "active")
      .map((p) => p.challengeId);

    return this.challenges
      .filter((c) => participantChallengeIds.includes(c.id))
      .map((c) => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        const totalMs = end.getTime() - start.getTime();
        const elapsedMs = Math.max(0, Math.min(now.getTime() - start.getTime(), totalMs));
        const timeProgress = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;

        const distanceGoal = c.distance ?? 0;
        const distanceDone = this.runs
          .filter((r) => r.userId === userId && r.challengeId === c.id)
          .reduce((sum, r) => sum + r.distance, 0);
        const distanceProgress =
          distanceGoal > 0 ? (distanceDone / distanceGoal) * 100 : 0;

        const progressPercent = Math.max(timeProgress, distanceProgress);
        const daysRemaining = Math.max(
          0,
          Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );

        return {
          id: c.id,
          title: c.title,
          progressPercent,
          daysRemaining
        };
      });
  }

  // Leaderboard operations
  recalculateLeaderboardForChallenge(challengeId: string) {
    const runsForChallenge = this.runs.filter((r) => r.challengeId === challengeId);
    const totals = new Map<
      string,
      {
        totalDistance: number;
        totalTime: number;
      }
    >();

    for (const run of runsForChallenge) {
      const key = run.userId;
      const current = totals.get(key) ?? { totalDistance: 0, totalTime: 0 };
      current.totalDistance += run.distance;
      current.totalTime += run.duration;
      totals.set(key, current);
    }

    // Remove existing leaderboard rows for this challenge
    this.leaderboards = this.leaderboards.filter(
      (row) => row.challengeId !== challengeId
    );

    const rows: LeaderboardRow[] = Array.from(totals.entries())
      .map(([userId, totalsForUser]) => ({
        challengeId,
        userId,
        totalDistance: totalsForUser.totalDistance,
        totalTime: totalsForUser.totalTime,
        rank: 0,
        updatedAt: new Date()
      }))
      .sort((a, b) => {
        if (b.totalDistance !== a.totalDistance) {
          return b.totalDistance - a.totalDistance;
        }
        return a.totalTime - b.totalTime;
      })
      .map((row, index) => ({
        ...row,
        rank: index + 1
      }));

    this.leaderboards.push(...rows);
  }

  getLeaderboard(challengeId: string): LeaderboardRow[] {
    return this.leaderboards
      .filter((row) => row.challengeId === challengeId)
      .sort((a, b) => a.rank - b.rank);
  }

  // Training tips – generated dynamically from simple templates
  getTrainingTips(): string[] {
    const now = new Date();
    const day = now.getDay();

    const tips: string[] = [
      "Keep easy runs truly easy to recover better.",
      "Aim for consistent weekly mileage instead of big spikes.",
      "Add light mobility work after your runs."
    ];

    if (day === 0 || day === 6) {
      tips.push("Use weekends for your longest run of the week.");
    } else {
      tips.push("Include short strides after an easy run to stay sharp.");
    }

    return tips;
  }
}

export const db = new InMemoryDB();

// Seed default users so login works after server restarts
db.createUser({
  role: "admin",
  name: "Admin User",
  email: "admin@example.com"
});

db.createUser({
  role: "athlete",
  name: "Demo Athlete",
  email: "athlete@example.com"
});

