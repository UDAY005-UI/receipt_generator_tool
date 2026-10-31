import type { InvoiceFormState, PolicySection } from "@/types/invoice";

/** Unique id for newly added policy sections. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Default policies taken from the reference PDF (editable by the user). */
export const DEFAULT_TERMS: PolicySection[] = [
  {
    id: "term-1",
    heading: "Membership Policy",
    description:
      "All memberships are personal, non-transferable, and must be used only by the registered member.\nMembers must carry their ID card/app confirmation during entry.",
  },
  {
    id: "term-2",
    heading: "Payment & Fees",
    description:
      "Membership fees, admission charges, and any other payments must be cleared in advance.\nAll fees are non-refundable and non-transferable, regardless of usage, cancellation, or early termination of membership.",
  },
  {
    id: "term-3",
    heading: "No Refund Policy",
    description:
      "Once a membership/package/payment is purchased, it cannot be refunded under any circumstances.\nFreeze/hold of membership may be allowed only in exceptional cases (e.g., medical issues) at the sole discretion of management.",
  },
  {
    id: "term-4",
    heading: "Code of Conduct",
    description:
      "Members are expected to maintain discipline and respect gym rules, equipment, and staff.\nMisbehavior or misuse of equipment may result in suspension or cancellation of membership without refund.",
  },
  {
    id: "term-5",
    heading: "Health & Safety",
    description:
      "Members should consult their physician before beginning any exercise program.\nThe gym will not be responsible for any injury, accident, or health issue arising during workouts.",
  },
  {
    id: "term-6",
    heading: "Amendments",
    description:
      "The studio reserves the right to change terms, fees, or policies at any time without prior notice.",
  },
];

/** Returns a fresh copy so edits never mutate the shared defaults. */
export function createDefaultInvoice(): InvoiceFormState {
  return {
    customer: {
      name: "",
      address: "",
      email: "",
      phone: "",
      memberId: "",
    },
    business: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    invoice: {
      invoiceNumber: "",
      invoiceDate: "",
      packageCategory: "",
      packageName: "",
      startDate: "",
      expiryDate: "",
    },
    financial: {
      amount: "",
      discount: "",
      paidAmount: "",
    },
    terms: DEFAULT_TERMS.map((section) => ({ ...section })),
  };
}