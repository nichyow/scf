import { NextResponse } from "next/server";
import { rejectFinancing } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { financingId, reason } = (await req.json()) as { financingId: string; reason?: string };
    const financing = rejectFinancing(financingId, reason);
    return NextResponse.json(financing);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
