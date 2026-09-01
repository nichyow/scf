import type { Notification } from "@/lib/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function NotificationFeed({ items }: { items: Notification[] }) {
  if (items.length === 0) {
    return <div className="px-4 py-6 text-center text-sm text-ink-faint">Belum ada notifikasi.</div>;
  }
  return (
    <ul className="divide-y divide-line">
      {items.map((n) => (
        <li key={n.id} className="flex gap-3 px-4 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-good-bg text-[13px]">
            💬
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-ink">{n.recipientLabel}</span>
              <span className="text-[11px] text-ink-faint">{timeAgo(n.timestamp)}</span>
            </div>
            <p className="mt-0.5 text-[13.5px] leading-snug text-ink-soft">{n.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
