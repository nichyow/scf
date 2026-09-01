import { NextResponse } from "next/server";
import { paySettlement } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { settlementId } = (await req.json()) as { settlementId: string };
    const settlement = paySettlement(settlementId);
    return NextResponse.json(settlement);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
