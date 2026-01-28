import type { ReactNode } from "react";
import "./globals.css";
import { BottomNav } from "../components/BottomNav";

export const metadata = {
  title: "Run Challenge",
  description: "Enterprise-grade run challenge platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 pb-16 px-4 pt-4 max-w-md mx-auto w-full">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

