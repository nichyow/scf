import { NextResponse } from "next/server";
import { createFinancing } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { poId, amountRequested } = body as { poId: string; amountRequested: number };
    if (!poId || !amountRequested || amountRequested <= 0) {
      return NextResponse.json({ error: "poId dan amountRequested wajib diisi" }, { status: 400 });
    }
    const financing = createFinancing(poId, amountRequested);
    return NextResponse.json(financing, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
