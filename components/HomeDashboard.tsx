"use client";

import useSWR from "swr";
import { fetcher } from "../lib/fetcher";

type DashboardResponse = {
  greeting: string;
  weeklyDistance: number;
  activeChallengesCount: number;
  myChallenges: {
    id: string;
    title: string;
    progressPercent: number;
    daysRemaining: number;
  }[];
  tips: string[];
};

export function HomeDashboard() {
  const { data, error, isLoading } = useSWR<DashboardResponse>(
    "/api/dashboard",
    fetcher
  );

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading dashboard…</p>;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-400">
        Trouble loading dashboard. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-semibold">{data.greeting}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Stay on track with your run challenges.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs text-slate-400">Distance this week</p>
          <p className="mt-1 text-xl font-semibold">
            {data.weeklyDistance.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs text-slate-400">Active challenges</p>
          <p className="mt-1 text-xl font-semibold">
            {data.activeChallengesCount}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          My challenges
        </h2>
        {data.myChallenges.length === 0 ? (
          <p className="text-xs text-slate-500">
            You&apos;re not in any challenges yet. Browse challenges to join.
          </p>
        ) : (
          <div className="space-y-2">
            {data.myChallenges.map((ch) => (
              <div
                key={ch.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{ch.title}</p>
                  <p className="text-xs text-slate-400">
                    {ch.daysRemaining} days left
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${Math.min(ch.progressPercent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {ch.progressPercent.toFixed(1)}% complete
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">Training tips</h2>
        <ul className="space-y-1 text-xs text-slate-400">
          {data.tips.map((tip, i) => (
            <li key={i} className="rounded-lg bg-slate-900/40 p-2">
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

