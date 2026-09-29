import { getSupabaseServer } from "@/lib/supabase";
import type { Lead, Message } from "@/lib/types";
import { ChatList } from "@/components/ChatList";
import { ChatThread } from "@/components/ChatThread";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ lead?: string }>;
}

async function fetchLeads(): Promise<Lead[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase leads: ${error.message}`);
  return (data ?? []) as Lead[];
}

async function fetchMessages(leadId: string): Promise<Message[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw new Error(`Supabase messages: ${error.message}`);
  return (data ?? []) as Message[];
}

export default async function ChatsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let leads: Lead[] = [];
  let errorMessage: string | null = null;

  try {
    leads = await fetchLeads();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  if (errorMessage) {
    return (
      <div className="page">
        <div className="alert-error">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar conversaciones
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const requestedId = params.lead ?? null;
  const activeId =
    requestedId && leads.some((l) => l.id === requestedId)
      ? requestedId
      : leads[0]?.id ?? null;

  const activeLead = activeId
    ? leads.find((l) => l.id === activeId) ?? null
    : null;

  let messages: Message[] = [];
  if (activeId) {
    try {
      messages = await fetchMessages(activeId);
    } catch {
      messages = [];
    }
  }

  return (
    <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
      <ChatList leads={leads} activeId={activeId} />
      <ChatThread lead={activeLead} messages={messages} />
    </div>
  );
}
