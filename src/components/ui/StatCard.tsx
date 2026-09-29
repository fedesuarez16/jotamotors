const accents = {
  ink: "bg-ink-900",
  brand: "bg-brand-600",
  sky: "bg-m-sky",
  emerald: "bg-emerald-500",
  red: "bg-m-red",
} as const;

export type StatAccent = keyof typeof accents;

export function StatCard({
  label,
  value,
  hint,
  accent = "ink",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: StatAccent;
}) {
  return (
    <div className="card relative overflow-hidden px-5 py-4">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${accents[accent]}`}
        aria-hidden
      />
      <p className="eyebrow">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-semibold tabular-nums text-ink-900">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
