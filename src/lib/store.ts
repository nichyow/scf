import type {
  FullState,
  Financing,
  Invoice,
  Settlement,
  Notification,
  SettlementChoice,
} from "./types";
import {
  seedVendors,
  seedPOs,
  seedFinancings,
  seedInvoices,
  seedSettlements,
  seedNotifications,
} from "./seed";

// In-memory demo store. Persisted on globalThis so Next.js dev/HMR reuses the
// same process-lifetime state instead of resetting on every module reload.
const g = globalThis as unknown as { __scfState?: FullState };

function freshState(): FullState {
  return {
    vendors: structuredClone(seedVendors),
    purchaseOrders: structuredClone(seedPOs),
    financings: structuredClone(seedFinancings),
    invoices: structuredClone(seedInvoices),
    settlements: structuredClone(seedSettlements),
    notifications: structuredClone(seedNotifications),
  };
}

if (!g.__scfState) {
  g.__scfState = freshState();
}

const state = g.__scfState;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function notify(
  recipientRole: Notification["recipientRole"],
  recipientLabel: string,
  message: string
) {
  state.notifications.unshift({
    id: uid("n"),
    timestamp: new Date().toISOString(),
    channel: "whatsapp",
    recipientRole,
    recipientLabel,
    message,
  });
}

export function getState(): FullState {
  return state;
}

export function resetState() {
  g.__scfState = freshState();
}

// ---- Tahap 1-2: pengajuan & pencairan KMK berbasis PO ----
export function createFinancing(poId: string, amountRequested: number): Financing {
  const po = state.purchaseOrders.find((p) => p.id === poId);
  if (!po) throw new Error("PO tidak ditemukan");
  const vendor = state.vendors.find((v) => v.id === po.vendorId);
  if (!vendor) throw new Error("Vendor tidak ditemukan");

  const used = state.financings
    .filter((f) => f.vendorId === vendor.id && f.status !== "lunas" && f.status !== "ditolak")
    .reduce((sum, f) => sum + f.amountRequested, 0);
  if (used + amountRequested > vendor.plafonKMK) {
    throw new Error("Pengajuan melebihi sisa plafon KMK vendor");
  }

  const financing: Financing = {
    id: uid("f"),
    poId,
    vendorId: po.vendorId,
    amountRequested,
    status: "diajukan",
    requestedDate: new Date().toISOString().slice(0, 10),
  };
  state.financings.push(financing);
  notify("vendor", vendor.name, `Pengajuan PO Financing sebesar Rp ${amountRequested.toLocaleString("id-ID")} untuk PO ${po.poNumber} telah diterima dan sedang diverifikasi Mandiri.`);
  return financing;
}

export function verifyAndDisburseFinancing(financingId: string): Financing {
  const financing = state.financings.find((f) => f.id === financingId);
  if (!financing) throw new Error("Pengajuan KMK tidak ditemukan");
  if (financing.status !== "diajukan") throw new Error("Pengajuan sudah diproses");

  financing.status = "dicairkan";
  financing.disbursedDate = new Date().toISOString().slice(0, 10);

  const vendor = state.vendors.find((v) => v.id === financing.vendorId)!;
  const po = state.purchaseOrders.find((p) => p.id === financing.poId)!;
  notify("vendor", vendor.name, `Dana KMK Rp ${financing.amountRequested.toLocaleString("id-ID")} untuk PO ${po.poNumber} telah cair ke rekening Anda.`);
  return financing;
}

export function rejectFinancing(financingId: string, reason?: string): Financing {
  const financing = state.financings.find((f) => f.id === financingId);
  if (!financing) throw new Error("Pengajuan KMK tidak ditemukan");
  if (financing.status !== "diajukan") throw new Error("Pengajuan sudah diproses");

  financing.status = "ditolak";
  financing.rejectedDate = new Date().toISOString().slice(0, 10);
  financing.rejectionReason = reason?.trim() || undefined;

  const vendor = state.vendors.find((v) => v.id === financing.vendorId)!;
  const po = state.purchaseOrders.find((p) => p.id === financing.poId)!;
  const reasonMsg = financing.rejectionReason ? ` Alasan: ${financing.rejectionReason}.` : "";
  notify("vendor", vendor.name, `Pengajuan PO Financing Rp ${financing.amountRequested.toLocaleString("id-ID")} untuk PO ${po.poNumber} ditolak Mandiri.${reasonMsg}`);
  return financing;
}

// ---- Tahap 3: submit invoice ----
export function submitInvoice(input: {
  poId: string;
  amount: number;
  invoiceNumber: string;
  dueDate: string;
  financingId?: string;
}): Invoice {
  const po = state.purchaseOrders.find((p) => p.id === input.poId);
  if (!po) throw new Error("PO tidak ditemukan");

  const invoice: Invoice = {
    id: uid("inv"),
    poId: input.poId,
    vendorId: po.vendorId,
    invoiceNumber: input.invoiceNumber,
    amount: input.amount,
    submittedDate: new Date().toISOString().slice(0, 10),
    dueDate: input.dueDate,
    status: "diajukan",
    financingId: input.financingId,
  };
  state.invoices.push(invoice);
  notify("pgn", "Tim Procurement PGN", `Invoice baru ${invoice.invoiceNumber} (Rp ${invoice.amount.toLocaleString("id-ID")}) diajukan untuk PO ${po.poNumber}, menunggu three-way matching.`);
  return invoice;
}

// ---- Tahap 4-5: approval PGN -> auto-settlement ----
export function approveInvoice(invoiceId: string): { invoice: Invoice; settlement: Settlement } {
  const invoice = state.invoices.find((i) => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice tidak ditemukan");
  if (invoice.status !== "diajukan") throw new Error("Invoice sudah diproses");

  invoice.status = "disetujui";
  invoice.approvedDate = new Date().toISOString().slice(0, 10);

  const vendor = state.vendors.find((v) => v.id === invoice.vendorId)!;
  const po = state.purchaseOrders.find((p) => p.id === invoice.poId)!;

  let kmkOffset = 0;
  const financing = invoice.financingId
    ? state.financings.find((f) => f.id === invoice.financingId)
    : undefined;
  if (financing && financing.status === "dicairkan") {
    kmkOffset = Math.min(financing.amountRequested, invoice.amount);
    financing.status = "lunas";
  }

  const settlement: Settlement = {
    id: uid("s"),
    invoiceId: invoice.id,
    vendorId: invoice.vendorId,
    financingId: financing?.id,
    kmkOffsetAmount: kmkOffset,
    remainingAmount: invoice.amount - kmkOffset,
    choice: "belum_dipilih",
    createdDate: new Date().toISOString().slice(0, 10),
    paidByPGN: false,
  };
  state.settlements.push(settlement);

  notify("pgn", "Tim Procurement PGN", `Invoice ${invoice.invoiceNumber} (Rp ${invoice.amount.toLocaleString("id-ID")}) untuk PO ${po.poNumber} telah disetujui.`);
  const offsetMsg = kmkOffset > 0
    ? `KMK Rp ${kmkOffset.toLocaleString("id-ID")} telah dilunasi otomatis dari invoice ini. `
    : "";
  notify("vendor", vendor.name, `Invoice ${invoice.invoiceNumber} Anda disetujui PGN. ${offsetMsg}Sisa dana Rp ${settlement.remainingAmount.toLocaleString("id-ID")} — silakan pilih tunggu jatuh tempo atau percepat pencairan.`);

  return { invoice, settlement };
}

// ---- Tahap 5 (lanjutan): pilihan vendor atas sisa dana ----
const ACCELERATION_FEE_RATE = 0.015;

export function chooseSettlement(settlementId: string, choice: SettlementChoice): Settlement {
  const settlement = state.settlements.find((s) => s.id === settlementId);
  if (!settlement) throw new Error("Settlement tidak ditemukan");
  if (settlement.choice !== "belum_dipilih") throw new Error("Pilihan sudah ditentukan");

  settlement.choice = choice;
  const vendor = state.vendors.find((v) => v.id === settlement.vendorId)!;

  if (choice === "percepat_pencairan") {
    settlement.feeRate = ACCELERATION_FEE_RATE;
    settlement.feeAmount = Math.round(settlement.remainingAmount * ACCELERATION_FEE_RATE);
    settlement.finalDisbursedAmount = settlement.remainingAmount - settlement.feeAmount;
    settlement.finalDisbursedDate = new Date().toISOString().slice(0, 10);
    notify("vendor", vendor.name, `Dana final Rp ${settlement.finalDisbursedAmount.toLocaleString("id-ID")} telah cair ke rekening Anda (setelah fee percepatan ${(ACCELERATION_FEE_RATE * 100).toFixed(1)}%).`);
  } else {
    notify("vendor", vendor.name, `Anda memilih menunggu jatuh tempo normal. Dana Rp ${settlement.remainingAmount.toLocaleString("id-ID")} akan cair setelah PGN membayar Mandiri.`);
  }
  return settlement;
}

// ---- Tahap 6: PGN bayar Mandiri saat jatuh tempo ----
export function paySettlement(settlementId: string): Settlement {
  const settlement = state.settlements.find((s) => s.id === settlementId);
  if (!settlement) throw new Error("Settlement tidak ditemukan");
  if (settlement.choice === "belum_dipilih") throw new Error("Vendor belum memilih skema pencairan");
  if (settlement.paidByPGN) throw new Error("Sudah dibayar");

  settlement.paidByPGN = true;
  settlement.paidByPGNDate = new Date().toISOString().slice(0, 10);

  if (settlement.choice === "tunggu_jatuh_tempo") {
    settlement.finalDisbursedAmount = settlement.remainingAmount;
    settlement.finalDisbursedDate = settlement.paidByPGNDate;
    const vendor = state.vendors.find((v) => v.id === settlement.vendorId)!;
    notify("vendor", vendor.name, `Dana Rp ${settlement.remainingAmount.toLocaleString("id-ID")} telah cair ke rekening Anda pada jatuh tempo normal.`);
  }

  notify("bank", "Ops Bank Mandiri", `PGN telah membayar kewajiban settlement ${settlement.id} sebesar Rp ${settlement.remainingAmount.toLocaleString("id-ID")}.`);
  return settlement;
}
