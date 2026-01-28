"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { AuthGate } from "../../components/AuthGate";

type ChallengesResponse = {
  challenges: {
    id: string;
    title: string;
    status: "active" | "upcoming" | "completed";
  }[];
};

type LeaderboardResponse = {
  challenge: { id: string; title: string };
  rows: {
    rank: number;
    userId: string;
    name: string;
    country: string | null;
    totalDistance: number;
    totalTime: number;
  }[];
  currentUserId: string | null;
};

function LeaderboardContent() {
  const { data: challengesData } = useSWR<ChallengesResponse>(
    "/api/challenges",
    fetcher
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const challengeId =
    selectedId ||
    challengesData?.challenges.find((c) => c.status === "active")?.id ||
    challengesData?.challenges[0]?.id ||
    null;

  const { data: leaderboardData, isLoading } = useSWR<LeaderboardResponse>(
    () =>
      challengeId ? `/api/leaderboard?challengeId=${encodeURIComponent(challengeId)}` : null,
    fetcher
  );

  const rows = leaderboardData?.rows ?? [];

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-slate-400">
          See how you stack up in each challenge.
        </p>
      </header>

      <div className="space-y-2">
        <label className="text-xs text-slate-300">Challenge</label>
        <select
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          value={challengeId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
        >
          {!challengesData && <option value="">Loading…</option>}
          {challengesData?.challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-400">Loading leaderboard…</p>
      )}

      {!isLoading && rows.length === 0 && (
        <p className="text-xs text-slate-500">
          No runs have been recorded for this challenge yet.
        </p>
      )}

      {rows.length > 0 && (
        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-xs">
          {rows.map((row) => {
            const isCurrent = row.userId === leaderboardData?.currentUserId;
            return (
              <div
                key={row.userId}
                className={`flex items-center justify-between rounded-lg px-2 py-1 ${
                  isCurrent ? "bg-emerald-500/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-right font-semibold">
                    {row.rank}
                  </span>
                  <div>
                    <p className="font-medium text-slate-100">{row.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {row.country ?? "Unknown location"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <p>{row.totalDistance.toFixed(1)} km</p>
                  <p className="text-slate-500">
                    {Math.round(row.totalTime / 60)} min total
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGate>
      <LeaderboardContent />
    </AuthGate>
  );
}

