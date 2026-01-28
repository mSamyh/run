"use client";

import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "athlete";
  } | null;
};

export function AuthGate({
  children,
  role
}: {
  children: React.ReactNode;
  role?: "admin" | "athlete";
}) {
  const router = useRouter();
  const { data, isLoading } = useSWR<MeResponse>("/api/auth/me", fetcher);

  useEffect(() => {
    if (!isLoading && data?.user == null) {
      router.replace("/login");
    } else if (!isLoading && role && data?.user && data.user.role !== role) {
      router.replace("/");
    }
  }, [data, isLoading, role, router]);

  if (isLoading || !data?.user) {
    return (
      <p className="text-sm text-slate-400">
        Checking authentication…
      </p>
    );
  }

  if (role && data.user.role !== role) {
    return (
      <p className="text-sm text-red-400">
        You don&apos;t have permission to view this page.
      </p>
    );
  }

  return <>{children}</>;
}

