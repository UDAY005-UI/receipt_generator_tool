import { z } from "zod";
import { PACKAGE_CATEGORIES } from "../types/invoice";
import type { FinancialInput, FinancialSummary } from "../types/invoice";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

const optionalEmail = z
  .string()
  .trim()
  .max(120, "Email is too long")
  .refine(
    (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Invalid email address"
  );

const phone = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .max(20, "Phone is too long")
  .regex(/^[0-9+()\-\s]+$/, "Phone can only contain digits, spaces, +, -, ( )");

const money = z
  .number({ invalid_type_error: "Must be a number" })
  .finite("Must be a valid number")
  .min(0, "Cannot be negative");

const partySchema = {
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(200, "Address is too long"),
  email: optionalEmail,
  phone,
};

export const invoiceSchema = z
  .object({
    customer: z.object({
      ...partySchema,
      memberId: z
        .string()
        .trim()
        .min(1, "Member ID is required")
        .max(30, "Member ID is too long"),
    }),
    business: z.object({ ...partySchema }),
    invoice: z
      .object({
        invoiceNumber: z
          .string()
          .trim()
          .min(1, "Invoice number is required")
          .max(30, "Invoice number is too long"),
        invoiceDate: isoDate,
        packageCategory: z.enum(PACKAGE_CATEGORIES, {
          errorMap: () => ({ message: "Select a package category" }),
        }),
        packageName: z
          .string()
          .trim()
          .min(1, "Package name is required")
          .max(60, "Package name is too long"),
        startDate: isoDate,
        expiryDate: isoDate,
      })
      .refine(
        (inv) => Date.parse(inv.expiryDate) >= Date.parse(inv.startDate),
        {
          message: "Expiry date cannot be before start date",
          path: ["expiryDate"],
        }
      ),
    financial: z.object({
      amount: money,
      discount: money,
      paidAmount: money,
    }),
    terms: z
      .array(
        z.object({
          id: z.string().min(1),
          heading: z
            .string()
            .trim()
            .min(1, "Section heading is required")
            .max(80, "Section heading is too long"),
          description: z
            .string()
            .trim()
            .min(1, "Section description is required")
            .max(1200, "Section description is too long"),
        })
      )
      .max(15, "Too many policy sections (max 15)"),
  })
  .superRefine((data, ctx) => {
    const { amount, discount, paidAmount } = data.financial;

    if (discount > amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount cannot exceed the amount",
        path: ["financial", "discount"],
      });
    }

    const finalAmount = amount - discount;
    if (paidAmount > finalAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid amount cannot exceed the final amount",
        path: ["financial", "paidAmount"],
      });
    }
  });

export type ValidatedInvoice = z.infer<typeof invoiceSchema>;

const round2 = (value: number): number => Math.round(value * 100) / 100;

export function computeFinancials(input: FinancialInput): FinancialSummary {
  const subtotal = round2(input.amount - input.discount);
  const finalAmount = subtotal;
  const dueAmount = round2(finalAmount - input.paidAmount);

  return {
    amount: round2(input.amount),
    discount: round2(input.discount),
    paidAmount: round2(input.paidAmount),
    subtotal,
    finalAmount,
    dueAmount,
  };
}