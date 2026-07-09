import { getSupabaseServer } from "@/lib/supabase";
import type { ChatStateFilter, Lead, SourceFilter } from "@/lib/types";
import { LeadsTable } from "@/components/LeadsTable";
import {
  ChatStateFilterDropdown,
  SearchBar,
  SourceFilterDropdown,
} from "@/components/Filters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ source?: string; chat?: string; q?: string }>;
}

function parseSourceFilter(value: string | undefined): SourceFilter {
  if (value === "meta_ads" || value === "organic") return value;
  return "all";
}

function parseChatFilter(value: string | undefined): ChatStateFilter {
  if (value === "activo" || value === "inactivo" || value === "cerrado")
    return value;
  return "all";
}

function sanitizeSearch(q: string): string {
  return q.replace(/[%(),"\\']/g, "").trim().slice(0, 80);
}

async function fetchFollowupIds(): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("lead_followups")
    .select("lead_id");
  if (error) {
    return [];
  }
  return (data ?? []).map((r) => r.lead_id as string);
}

async function fetchLeads(
  source: SourceFilter,
  chat: ChatStateFilter,
  q: string
): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("leads")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(200);

  if (source !== "all") {
    query = query.eq("source", source);
  }

  if (chat !== "all") {
    query = query.eq("estado_chat", chat);
  }

  const safeQ = sanitizeSearch(q);
  if (safeQ) {
    query = query.or(`name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return (data ?? []) as Lead[];
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sourceFilter = parseSourceFilter(params.source);
  const chatFilter = parseChatFilter(params.chat);
  const search = (params.q ?? "").trim();

  let leads: Lead[] = [];
  let followupIds: string[] = [];
  let errorMessage: string | null = null;

  try {
    [leads, followupIds] = await Promise.all([
      fetchLeads(sourceFilter, chatFilter, search),
      fetchFollowupIds(),
    ]);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  const totalLeads = leads.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            No se pudo cargar leads
          </p>
          <p className="mt-1 font-mono text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
          <p className="mt-3 text-xs text-red-700 dark:text-red-300">
            Verificá que <code>SUPABASE_URL</code> y{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> estén configurados en{" "}
            <code>.env.local</code> y que las tablas <code>leads</code> y{" "}
            <code>messages</code> existan en tu proyecto Supabase.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <SearchBar />
            <SourceFilterDropdown active={sourceFilter} />
            <ChatStateFilterDropdown active={chatFilter} />
          </div>
          <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            Mostrando {totalLeads} {totalLeads === 1 ? "lead" : "leads"}
            {search ? ` para "${search}"` : ""}
          </p>
          <LeadsTable leads={leads} followupIds={followupIds} />
        </>
      )}
    </div>
  );
}
