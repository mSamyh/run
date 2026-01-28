"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { AuthGate } from "../../components/AuthGate";

type ChallengesResponse = {
  challenges: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    challengeType: string;
    distance: number | null;
    participantsCount: number;
    status: "active" | "upcoming" | "completed";
  }[];
};

async function createChallenge(body: unknown) {
  const res = await fetch("/api/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed with ${res.status}`);
  }
  return res.json();
}

function AdminContent() {
  const { data, mutate } = useSWR<ChallengesResponse>(
    "/api/challenges",
    fetcher
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [distance, setDistance] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createChallenge({
        title,
        description,
        startDate,
        endDate,
        challengeType: "distance",
        distance: distance ? Number(distance) : undefined
      });
      setTitle("");
      setDescription("");
      setDistance("");
      setStartDate("");
      setEndDate("");
      await mutate();
    } catch (err: any) {
      setError(err.message ?? "Failed to create challenge");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-slate-400">
          Create and manage run challenges.
        </p>
      </header>

      <section className="space-y-2 text-xs">
        <h2 className="font-semibold text-slate-100">New challenge</h2>
        <form onSubmit={handleCreate} className="space-y-2">
          <div>
            <label className="text-slate-400">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-slate-400">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400">Start date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-slate-400">End date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400">Distance goal (km)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-slate-950 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create challenge"}
          </button>
        </form>
      </section>

      <section className="space-y-2 text-xs">
        <h2 className="font-semibold text-slate-100">Existing challenges</h2>
        {!data && <p className="text-slate-500">Loading…</p>}
        {data?.challenges.length === 0 && (
          <p className="text-slate-500">No challenges yet.</p>
        )}
        <div className="space-y-2">
          {data?.challenges.map((ch) => (
            <div
              key={ch.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{ch.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(ch.startDate).toLocaleDateString()} –{" "}
                    {new Date(ch.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                  {ch.status}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                {ch.description}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {ch.participantsCount} participant
                {ch.participantsCount === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGate role="admin">
      <AdminContent />
    </AuthGate>
  );
}

