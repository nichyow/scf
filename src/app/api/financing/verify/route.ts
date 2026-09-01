import { NextResponse } from "next/server";
import { verifyAndDisburseFinancing } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { financingId } = (await req.json()) as { financingId: string };
    const financing = verifyAndDisburseFinancing(financingId);
    return NextResponse.json(financing);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
