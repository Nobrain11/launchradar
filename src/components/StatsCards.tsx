import { Activity, MessageCircle, Layers, Clock } from "lucide-react";
import { DashboardStats } from "@/types";
import { formatTimestamp } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total New Launches",
      value: stats.totalLaunches.toLocaleString(),
      sub: "Across all sources",
      icon: Activity,
      accent: false,
    },
    {
      label: "With Telegram",
      value: stats.withTelegram.toLocaleString(),
      sub: "Public groups only",
      icon: MessageCircle,
      accent: true,
    },
    {
      label: "Supported Chains",
      value: stats.chainsRepresented.toString(),
      sub: "SOL · ETH · Base · BNB",
      icon: Layers,
      accent: false,
    },
    {
      label: "Last Sync",
      value: formatTimestamp(stats.lastSync),
      sub: stats.isDemoData ? "Demo mode" : "Live",
      icon: Clock,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-card p-4 transition-colors ${
            card.accent ? "border-accent/30 glow-green" : "border-border"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">{card.sub}</p>
            </div>
            <div
              className={`rounded-lg p-2 ${
                card.accent ? "bg-accent/15 text-accent" : "bg-card-hover text-muted"
              }`}
            >
              <card.icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
