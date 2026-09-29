import { getSupabaseServer } from "@/lib/supabase";
import { LeadsCharts } from "@/components/LeadsCharts";

import { StatCard } from "@/components/ui/StatCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface DayStat {
  date: string; // "DD/MM"
  total: number;
  meta_ads: number;
  organic: number;
}

export interface SourceStat {
  name: string;
  value: number;
}

export interface StatusStat {
  status: string;
  total: number;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Nuevo",
  engaged: "Enganchado",
  qualified: "Calificado",
  booked: "Con turno",
  closed: "Cerrado",
};

function buildDayStats(
  leads: { first_seen_at: string; source: string }[]
): DayStat[] {
  const today = new Date();
  const map = new Map<string, DayStat>();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, { date: label, total: 0, meta_ads: 0, organic: 0 });
  }

  for (const lead of leads) {
    const key = lead.first_seen_at.slice(0, 10);
    const entry = map.get(key);
    if (!entry) continue;
    entry.total++;
    if (lead.source === "meta_ads") entry.meta_ads++;
    else entry.organic++;
  }

  return Array.from(map.values());
}

function buildSourceStats(
  leads: { source: string }[]
): SourceStat[] {
  let meta = 0;
  let organic = 0;
  for (const l of leads) {
    if (l.source === "meta_ads") meta++;
    else organic++;
  }
  return [
    { name: "Meta Ads", value: meta },
    { name: "Orgánicos", value: organic },
  ];
}

function buildStatusStats(
  leads: { status: string }[]
): StatusStat[] {
  const counts: Record<string, number> = {
    new: 0,
    engaged: 0,
    qualified: 0,
    booked: 0,
    closed: 0,
  };
  for (const l of leads) {
    if (l.status in counts) counts[l.status]++;
  }
  return Object.entries(counts).map(([status, total]) => ({
    status: STATUS_LABEL[status] ?? status,
    total,
  }));
}

export default async function GraficosPage() {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("leads")
    .select("first_seen_at, source, status")
    .order("first_seen_at", { ascending: true });

  if (error) {
    return (
      <div className="page">
        <div className="alert-error">Error: {error.message}</div>
      </div>
    );
  }

  const leads = data ?? [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const recentLeads = leads.filter(
    (l) => new Date(l.first_seen_at) >= cutoff
  );

  const dayStats = buildDayStats(recentLeads);
  const sourceStats = buildSourceStats(leads);
  const statusStats = buildStatusStats(leads);

  return (
    <div className="page">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Leads totales" value={leads.length} />
        <StatCard
          label="Últimos 30 días"
          value={recentLeads.length}
          accent="sky"
        />
        <StatCard
          label="Meta Ads"
          value={sourceStats[0].value}
          accent="brand"
        />
        <StatCard
          label="Turnos tomados"
          value={leads.filter((l) => l.status === "booked").length}
          accent="emerald"
        />
      </div>

      <LeadsCharts
        dayStats={dayStats}
        sourceStats={sourceStats}
        statusStats={statusStats}
      />
    </div>
  );
}
