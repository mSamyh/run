"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"athlete" | "admin">("athlete");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await post("/api/auth/signup", { name, email, role });
      } else {
        await post("/api/auth/login", { email });
      }
      router.replace("/");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to track your run challenges.
        </p>
      </header>

      <div className="flex gap-2 rounded-full bg-slate-900/80 p-1 text-xs">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-1 ${
            mode === "login" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-1 ${
            mode === "signup" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
          }`}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Name</label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Role</label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole("athlete")}
                className={`flex-1 rounded-full border px-3 py-1 ${
                  role === "athlete"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                Athlete
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 rounded-full border px-3 py-1 ${
                  role === "admin"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {loading
            ? mode === "login"
              ? "Logging in…"
              : "Creating account…"
            : mode === "login"
            ? "Login"
            : "Sign up"}
        </button>
      </form>
    </div>
  );
}

