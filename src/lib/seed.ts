import type { Vendor, PurchaseOrder, Financing, Invoice, Settlement, Notification } from "./types";

export const seedVendors: Vendor[] = [
  { id: "v1", name: "CV Cipta Jaringan Gas", tier: "1", category: "Konstruksi Pipa Distribusi", plafonKMK: 2_000_000_000 },
  { id: "v2", name: "PT Nusa Katup Industri", tier: "1", category: "Peralatan & Katup Gas", plafonKMK: 1_500_000_000 },
  { id: "v3", name: "PT Meter Presisi Nusantara", tier: "2", category: "Meter & Instrumentasi", plafonKMK: 500_000_000 },
  { id: "v4", name: "CV Sumber Konektor Abadi", tier: "2", category: "Material Sambungan", plafonKMK: 350_000_000 },
];

export const seedPOs: PurchaseOrder[] = [
  { id: "po1", poNumber: "PGN/PO/2026/0812", vendorId: "v1", description: "Pemasangan pipa distribusi gas rumah tangga — Zona Bekasi Timur", value: 4_800_000_000, issuedDate: "2026-07-10", workDueDate: "2026-09-20" },
  { id: "po2", poNumber: "PGN/PO/2026/0845", vendorId: "v2", description: "Pengadaan katup regulator tekanan tinggi — 120 unit", value: 1_950_000_000, issuedDate: "2026-07-22", workDueDate: "2026-09-05" },
  { id: "po3", poNumber: "PGN/PO/2026/0861", vendorId: "v3", description: "Pengadaan & kalibrasi meter gas digital — 300 unit", value: 720_000_000, issuedDate: "2026-08-01", workDueDate: "2026-09-10" },
  { id: "po4", poNumber: "PGN/PO/2026/0879", vendorId: "v4", description: "Material sambungan pipa PE — gasifikasi DME tahap 2", value: 410_000_000, issuedDate: "2026-08-12", workDueDate: "2026-09-25" },
  { id: "po5", poNumber: "PGN/PO/2026/0803", vendorId: "v1", description: "Perluasan jaringan CNG — segmen Cikarang", value: 3_100_000_000, issuedDate: "2026-06-18", workDueDate: "2026-08-28" },
  { id: "po6", poNumber: "PGN/PO/2026/0890", vendorId: "v2", description: "Pengadaan aksesoris & fitting pipa gas — batch September", value: 680_000_000, issuedDate: "2026-08-30", workDueDate: "2026-10-15" },
];

export const seedFinancings: Financing[] = [
  { id: "f1", poId: "po1", vendorId: "v1", amountRequested: 1_800_000_000, status: "dicairkan", requestedDate: "2026-07-12", disbursedDate: "2026-07-15" },
  { id: "f2", poId: "po3", vendorId: "v3", amountRequested: 300_000_000, status: "diverifikasi", requestedDate: "2026-08-25" },
  { id: "f3", poId: "po5", vendorId: "v1", amountRequested: 1_200_000_000, status: "lunas", requestedDate: "2026-06-20", disbursedDate: "2026-06-23" },
];

export const seedInvoices: Invoice[] = [
  { id: "inv1", poId: "po5", vendorId: "v1", invoiceNumber: "INV/CJG/2026/091", amount: 3_100_000_000, submittedDate: "2026-08-26", dueDate: "2026-09-25", status: "disetujui", approvedDate: "2026-08-28", financingId: "f3" },
  { id: "inv2", poId: "po2", vendorId: "v2", invoiceNumber: "INV/NKI/2026/044", amount: 1_950_000_000, submittedDate: "2026-08-27", dueDate: "2026-09-05", status: "diajukan" },
  { id: "inv3", poId: "po4", vendorId: "v4", invoiceNumber: "INV/SKA/2026/012", amount: 410_000_000, submittedDate: "2026-08-29", dueDate: "2026-09-02", status: "diajukan" },
];

export const seedSettlements: Settlement[] = [
  {
    id: "s1",
    invoiceId: "inv1",
    vendorId: "v1",
    financingId: "f3",
    kmkOffsetAmount: 1_200_000_000,
    remainingAmount: 1_900_000_000,
    choice: "percepat_pencairan",
    feeRate: 0.015,
    feeAmount: 28_500_000,
    finalDisbursedAmount: 1_871_500_000,
    finalDisbursedDate: "2026-08-28",
    createdDate: "2026-08-28",
    paidByPGN: false,
  },
];

export const seedNotifications: Notification[] = [
  { id: "n1", timestamp: "2026-07-15T09:12:00", channel: "whatsapp", recipientRole: "vendor", recipientLabel: "CV Cipta Jaringan Gas", message: "Dana KMK Rp 1.800.000.000 untuk PO PGN/PO/2026/0812 telah cair ke rekening Anda." },
  { id: "n2", timestamp: "2026-06-23T10:04:00", channel: "whatsapp", recipientRole: "vendor", recipientLabel: "CV Cipta Jaringan Gas", message: "Dana KMK Rp 1.200.000.000 untuk PO PGN/PO/2026/0803 telah cair ke rekening Anda." },
  { id: "n3", timestamp: "2026-08-28T14:30:00", channel: "whatsapp", recipientRole: "pgn", recipientLabel: "Tim Procurement PGN", message: "Invoice INV/CJG/2026/091 (Rp 3.100.000.000) telah disetujui dan diteruskan ke proses settlement." },
  { id: "n4", timestamp: "2026-08-28T14:31:00", channel: "whatsapp", recipientRole: "vendor", recipientLabel: "CV Cipta Jaringan Gas", message: "Invoice Anda disetujui PGN. KMK Rp 1.200.000.000 telah dilunasi otomatis. Anda memilih percepat pencairan sisa dana." },
  { id: "n5", timestamp: "2026-08-28T14:32:00", channel: "whatsapp", recipientRole: "vendor", recipientLabel: "CV Cipta Jaringan Gas", message: "Dana final Rp 1.871.500.000 telah cair ke rekening Anda (setelah fee percepatan 1,5%)." },
];
