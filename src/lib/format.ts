export function rupiah(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysUntil(iso: string): number {
  const today = new Date("2026-08-31T00:00:00");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
