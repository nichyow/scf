import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-line bg-paper-raised shadow-[0_1px_2px_rgba(20,33,61,0.06),0_8px_20px_rgba(20,33,61,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "neutral" | "accent" | "gas" | "warn" | "good" | "bad";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-line/40 text-ink-soft",
    accent: "bg-accent-soft text-accent",
    gas: "bg-gas-soft text-gas",
    warn: "bg-warn-bg text-warn",
    good: "bg-good-bg text-good",
    bad: "bg-bad-bg text-bad",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-6 border-b border-line pb-4">
      <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] tracking-widest text-gas uppercase">
        <span className="inline-block h-px w-5 bg-gas" />
        {eyebrow}
      </div>
      <h2 className="text-2xl">{title}</h2>
      {desc && <p className="mt-1.5 max-w-[65ch] text-ink-soft">{desc}</p>}
    </div>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="px-4 py-3.5">
      <div className="mb-1.5 text-[11px] tracking-wide text-ink-faint uppercase">{label}</div>
      <div className="num text-lg font-semibold text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-faint">{sub}</div>}
    </Card>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-5 py-8 text-center text-sm text-ink-faint">
      {children}
    </div>
  );
}
