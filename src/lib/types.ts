export type VendorTier = "1" | "2";

export interface Vendor {
  id: string;
  name: string;
  tier: VendorTier;
  category: string;
  plafonKMK: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  description: string;
  value: number;
  issuedDate: string; // ISO date
  workDueDate: string; // tanggal target pekerjaan selesai
}

export type FinancingStatus = "diajukan" | "diverifikasi" | "dicairkan" | "lunas" | "ditolak";

export interface Financing {
  id: string;
  poId: string;
  vendorId: string;
  amountRequested: number;
  status: FinancingStatus;
  requestedDate: string;
  disbursedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

export type InvoiceStatus = "diajukan" | "disetujui" | "ditolak";

export interface Invoice {
  id: string;
  poId: string;
  vendorId: string;
  invoiceNumber: string;
  amount: number;
  submittedDate: string;
  dueDate: string; // jatuh tempo pembayaran PGN ke Mandiri
  status: InvoiceStatus;
  approvedDate?: string;
  financingId?: string; // KMK terkait yang akan di-offset, jika ada
}

export type SettlementChoice = "belum_dipilih" | "tunggu_jatuh_tempo" | "percepat_pencairan";

export interface Settlement {
  id: string;
  invoiceId: string;
  vendorId: string;
  financingId?: string;
  kmkOffsetAmount: number;
  remainingAmount: number;
  choice: SettlementChoice;
  feeRate?: number;
  feeAmount?: number;
  finalDisbursedAmount?: number;
  finalDisbursedDate?: string;
  createdDate: string;
  paidByPGN: boolean;
  paidByPGNDate?: string;
}

export interface Notification {
  id: string;
  timestamp: string;
  channel: "whatsapp";
  recipientRole: "vendor" | "pgn" | "bank";
  recipientLabel: string;
  message: string;
}

export interface FullState {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  financings: Financing[];
  invoices: Invoice[];
  settlements: Settlement[];
  notifications: Notification[];
}
