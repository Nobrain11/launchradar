"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, Search, Star, Database, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/launches", label: "New Launches", icon: Radar },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/admin", label: "Data Sources", icon: Database },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Radar className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">
            Launch<span className="text-accent">Radar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground-muted hover:bg-card-hover hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search name, symbol, address…"
              className="h-8 w-56 rounded-md border border-border bg-card pl-8 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  window.location.href = `/launches?q=${encodeURIComponent(q)}`;
                }
              }}
            />
          </div>
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
            Demo
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-2 py-1.5 md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs",
                active ? "bg-accent/10 text-accent" : "text-foreground-muted"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
