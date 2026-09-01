import { NextResponse } from "next/server";
import { approveInvoice } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { invoiceId } = (await req.json()) as { invoiceId: string };
    const result = approveInvoice(invoiceId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
