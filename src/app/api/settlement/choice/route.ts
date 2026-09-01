import { NextResponse } from "next/server";
import { chooseSettlement } from "@/lib/store";
import type { SettlementChoice } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { settlementId, choice } = (await req.json()) as {
      settlementId: string;
      choice: SettlementChoice;
    };
    const settlement = chooseSettlement(settlementId, choice);
    return NextResponse.json(settlement);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
