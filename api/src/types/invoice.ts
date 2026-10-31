export interface PartyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface CustomerDetails extends PartyDetails {
  memberId: string;
}

export type BusinessDetails = PartyDetails;

export interface InvoiceInfo {
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  program: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
}

export interface FinancialInput {
  amount: number;
  discount: number;
  paidAmount: number;
}

export interface FinancialSummary extends FinancialInput {
  subtotal: number;
  finalAmount: number;
  dueAmount: number;
}

export interface PolicySection {
  id: string;
  heading: string;
  description: string;
}

/** Payload sent by the frontend to POST /api/pdf/generate */
export interface InvoiceData {
  customer: CustomerDetails;
  business: BusinessDetails;
  invoice: InvoiceInfo;
  financial: FinancialInput;
  terms: PolicySection[];
}

/** Payload after the server recomputes totals (used by the template) */
export interface InvoiceRenderData extends Omit<InvoiceData, "financial"> {
  financial: FinancialSummary;
}