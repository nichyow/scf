import { NextResponse } from "next/server";
import { submitInvoice } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { poId, amount, invoiceNumber, dueDate, financingId } = body as {
      poId: string;
      amount: number;
      invoiceNumber: string;
      dueDate: string;
      financingId?: string;
    };
    if (!poId || !amount || !invoiceNumber || !dueDate) {
      return NextResponse.json({ error: "Semua field invoice wajib diisi" }, { status: 400 });
    }
    const invoice = submitInvoice({ poId, amount, invoiceNumber, dueDate, financingId });
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
