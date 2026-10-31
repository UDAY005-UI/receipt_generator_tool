export const PACKAGE_CATEGORIES = [
  "one-time-content",
  "monthly-content",
  "website",
] as const;

export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number];

export const PACKAGE_CATEGORY_LABELS: Record<PackageCategory, string> = {
  "one-time-content": "One-time Content Package",
  "monthly-content": "Monthly Content Package",
  website: "Website Package",
};

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
  /** Empty string = nothing selected yet (validated before sending). */
  packageCategory: PackageCategory | "";
  packageName: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
}

export interface PolicySection {
  id: string;
  heading: string;
  description: string;
}

/** Money fields stay as strings in the form so typing is never blocked. */
export interface FinancialFormState {
  amount: string; // entered as "Package amount"
  discount: string;
  paidAmount: string;
}

export interface InvoiceFormState {
  customer: CustomerDetails;
  business: BusinessDetails;
  invoice: InvoiceInfo;
  financial: FinancialFormState;
  terms: PolicySection[];
}

/** Calculated values shown live in the Financial section. */
export interface FinancialSummary {
  amount: number;
  discount: number;
  subtotal: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

/** Exact JSON body sent to POST /api/pdf/generate */
export interface InvoicePayload {
  customer: CustomerDetails;
  business: BusinessDetails;
  invoice: InvoiceInfo;
  financial: {
    amount: number;
    discount: number;
    paidAmount: number;
  };
  terms: PolicySection[];
}

/**
 * Validation errors keyed by field path, e.g. "customer.name",
 * "financial.discount", "terms.2.heading". The key "terms" holds
 * section-list level errors.
 */
export type FormErrors = Record<string, string>;

export interface ApiValidationIssue {
  path: string;
  message: string;
}

/** Error body returned by the backend. */
export interface ApiErrorBody {
  message: string;
  errors?: ApiValidationIssue[];
}