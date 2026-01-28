"use client";

import useSWR from "swr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetcher } from "../../lib/fetcher";
import { AuthGate } from "../../components/AuthGate";

type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "athlete";
    avatar: string | null;
    ageGroup: string | null;
    country: string | null;
    club: string | null;
    stravaConnected: boolean;
  };
  stats: {
    totalDistance: number;
    lastRunAt: string | null;
  };
};

async function updateProfile(body: unknown) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed with ${res.status}`);
  }
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

function ProfileContent() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher
  );
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [club, setClub] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading profile…</p>;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-400">
        Could not load profile. Please try again.
      </p>
    );
  }

  const { user, stats } = data;

  function startEdit() {
    setName(user.name);
    setCountry(user.country ?? "");
    setClub(user.club ?? "");
    setAgeGroup(user.ageGroup ?? "");
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({ name, country, club, ageGroup });
      await mutate();
      setEditing(false);
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-xs text-slate-400">
            {user.email} · {user.role === "admin" ? "Admin" : "Athlete"}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">Total distance</p>
          <p className="mt-1 text-xl font-semibold">
            {stats.totalDistance.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">Last run</p>
          <p className="mt-1 text-sm">
            {stats.lastRunAt
              ? new Date(stats.lastRunAt).toLocaleDateString()
              : "No runs yet"}
          </p>
        </div>
      </section>

      <section className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-100">Profile</h2>
          <button
            className="text-[11px] text-emerald-400"
            onClick={editing ? () => setEditing(false) : startEdit}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-2">
            <div>
              <label className="text-slate-400">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-400">Country</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-400">Club</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-400">Age group</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              />
            </div>
            {saveError && (
              <p className="text-[11px] text-red-400">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="mt-1 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-slate-950 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        ) : (
          <div className="space-y-1">
            <p>
              <span className="text-slate-500">Country: </span>
              {user.country || "Not set"}
            </p>
            <p>
              <span className="text-slate-500">Club: </span>
              {user.club || "Not set"}
            </p>
            <p>
              <span className="text-slate-500">Age group: </span>
              {user.ageGroup || "Not set"}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-2 text-xs">
        <h2 className="font-semibold text-slate-100">Strava</h2>
        <p className="text-slate-400">
          Status:{" "}
          <span className="font-medium">
            {user.stravaConnected ? "Connected" : "Not connected"}
          </span>
        </p>
        <p className="text-[11px] text-slate-500">
          Strava connection flow is not wired yet; once integrated, your outdoor
          runs will sync automatically into active challenges.
        </p>
      </section>

      <section className="space-y-2 text-xs">
        <h2 className="font-semibold text-slate-100">Account</h2>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-red-500/60 px-3 py-2 text-xs font-medium text-red-400"
        >
          Logout
        </button>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}

