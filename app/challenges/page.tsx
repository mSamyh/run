"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "../../lib/fetcher";
import { AuthGate } from "../../components/AuthGate";
import { useState } from "react";

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  challengeType: string;
  distance: number | null;
  visibility: "public" | "private";
  participantsCount: number;
  status: "active" | "upcoming" | "completed";
};

type ChallengesResponse = {
  challenges: Challenge[];
};

const tabs: { id: Challenge["status"]; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" }
];

function ChallengesContent() {
  const { data, error, isLoading } = useSWR<ChallengesResponse>(
    "/api/challenges",
    fetcher
  );
  const [tab, setTab] = useState<Challenge["status"]>("active");

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading challenges…</p>;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-400">
        Could not load challenges. Please try again.
      </p>
    );
  }

  const filtered = data.challenges.filter((c) => c.status === tab);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Challenges</h1>
        <p className="text-sm text-slate-400">
          Join challenges that fit your training.
        </p>
      </header>

      <div className="flex gap-2 rounded-full bg-slate-900/80 p-1 text-xs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`flex-1 rounded-full px-3 py-1 ${
              tab === t.id
                ? "bg-emerald-500 text-slate-950"
                : "text-slate-400"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500">
          No {tab} challenges yet. Check back soon.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((ch) => (
            <Link
              key={ch.id}
              href={`/challenges/${ch.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{ch.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {ch.description}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                  {ch.challengeType}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {new Date(ch.startDate).toLocaleDateString()} –{" "}
                  {new Date(ch.endDate).toLocaleDateString()}
                </span>
                <span>
                  {ch.distance ? `${ch.distance} km` : "No fixed distance"}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {ch.participantsCount} participant
                {ch.participantsCount === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <AuthGate>
      <ChallengesContent />
    </AuthGate>
  );
}

