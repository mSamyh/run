"use client";

import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import { fetcher } from "../../../lib/fetcher";
import { AuthGate } from "../../../components/AuthGate";
import { useState } from "react";

type ChallengeDetail = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  challengeType: string;
  distance: number | null;
  time: number | null;
  frequency: string | null;
  rules: unknown;
  visibility: "public" | "private";
  participantsCount: number;
  status: "active" | "upcoming" | "completed";
};

async function joinChallenge(id: string) {
  const res = await fetch(`/api/challenges/${id}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed with ${res.status}`);
  }
  return res.json();
}

function ChallengeDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<ChallengeDetail>(
    `/api/challenges/${params.id}`,
    fetcher
  );
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoin() {
    if (!data) return;
    setJoining(true);
    setJoinError(null);
    try {
      await joinChallenge(data.id);
      await mutate();
      router.push("/leaderboard");
    } catch (err: any) {
      setJoinError(err.message ?? "Could not join challenge");
    } finally {
      setJoining(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading challenge…</p>;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-400">
        Challenge not found or failed to load.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        className="text-xs text-slate-400"
        onClick={() => router.back()}
      >
        ← Back
      </button>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-sm text-slate-400">{data.description}</p>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="rounded-full bg-slate-900 px-2 py-0.5 uppercase tracking-wide text-slate-200">
            {data.challengeType}
          </span>
          <span>
            {new Date(data.startDate).toLocaleDateString()} –{" "}
            {new Date(data.endDate).toLocaleDateString()}
          </span>
          <span>{data.participantsCount} participants</span>
        </div>
      </header>

      <section className="space-y-1 text-xs text-slate-300">
        {data.distance && (
          <p>
            <span className="text-slate-500">Distance goal: </span>
            {data.distance} km
          </p>
        )}
        {data.time && (
          <p>
            <span className="text-slate-500">Time goal: </span>
            {data.time} minutes
          </p>
        )}
        {data.frequency && (
          <p>
            <span className="text-slate-500">Frequency: </span>
            {data.frequency}
          </p>
        )}
        <p>
          <span className="text-slate-500">Registration deadline: </span>
          {new Date(data.registrationDeadline).toLocaleDateString()}
        </p>
        <p>
          <span className="text-slate-500">Visibility: </span>
          {data.visibility}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Eligibility & rules
        </h2>
        <p className="text-xs text-slate-400">
          Runs recorded on Strava within the challenge window will
          automatically count toward your progress once Strava is connected in
          your profile. Only outdoor runs are eligible; treadmill sessions are
          ignored.
        </p>
      </section>

      {joinError && <p className="text-xs text-red-400">{joinError}</p>}

      {data.status === "completed" ? (
        <p className="text-xs text-slate-500">
          This challenge has finished. You can still view its leaderboard.
        </p>
      ) : (
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {joining
            ? "Joining…"
            : data.status === "upcoming"
            ? "Join challenge"
            : "Join & start running"}
        </button>
      )}
    </div>
  );
}

export default function ChallengeDetailPage() {
  return (
    <AuthGate>
      <ChallengeDetailContent />
    </AuthGate>
  );
}

