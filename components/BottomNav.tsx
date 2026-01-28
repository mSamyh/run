"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "athlete";
  } | null;
};

const baseItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/challenges", label: "Challenges", icon: "🏆" },
  { href: "/leaderboard", label: "Leaderboard", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "👤" }
];

export function BottomNav() {
  const pathname = usePathname();
  const { data } = useSWR<MeResponse>("/api/auth/me", fetcher);

  if (pathname === "/login") {
    return null;
  }

  const isAdmin = data?.user?.role === "admin";
  const items = isAdmin
    ? [...baseItems, { href: "/admin", label: "Admin", icon: "⚙️" }]
    : baseItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center text-xs ${
                active ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

