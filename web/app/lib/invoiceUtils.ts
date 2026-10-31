import type {
  FinancialFormState,
  FinancialSummary,
  FormErrors,
  InvoiceFormState,
  InvoicePayload,
} from "@/types/invoice";

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_TERMS_SECTIONS = 15;

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Returns NaN for empty or invalid input. */
export function parseMoney(value: string): number {
  const trimmed = value.trim();
  if (!MONEY_PATTERN.test(trimmed)) return NaN;
  return Number(trimmed);
}

/** Like parseMoney, but treats empty/invalid as 0 (for live display). */
function moneyOrZero(value: string): number {
  const parsed = parseMoney(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computeFinancials(
  financial: FinancialFormState
): FinancialSummary {
  const amount = moneyOrZero(financial.amount);
  const discount = moneyOrZero(financial.discount);
  const paidAmount = moneyOrZero(financial.paidAmount);

  const subtotal = round2(amount - discount);
  const finalAmount = subtotal;
  const dueAmount = round2(finalAmount - paidAmount);

  return {
    amount: round2(amount),
    discount: round2(discount),
    subtotal,
    finalAmount,
    paidAmount: round2(paidAmount),
    dueAmount,
  };
}

function isValidDate(value: string): boolean {
  return DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

function checkRequired(
  errors: FormErrors,
  key: string,
  value: string,
  label: string,
  maxLength: number
): void {
  const trimmed = value.trim();
  if (trimmed === "") {
    errors[key] = `${label} is required`;
  } else if (trimmed.length > maxLength) {
    errors[key] = `${label} is too long (max ${maxLength} characters)`;
  }
}

function checkEmail(errors: FormErrors, key: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed === "") return; // email is optional
  if (trimmed.length > 120) {
    errors[key] = "Email is too long";
  } else if (!EMAIL_PATTERN.test(trimmed)) {
    errors[key] = "Enter a valid email address";
  }
}

function checkPhone(errors: FormErrors, key: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed === "") {
    errors[key] = "Phone is required";
  } else if (trimmed.length > 20) {
    errors[key] = "Phone is too long (max 20 characters)";
  } else if (!PHONE_PATTERN.test(trimmed)) {
    errors[key] = "Use digits, spaces, +, -, ( ) only";
  }
}

export function validateInvoice(form: InvoiceFormState): FormErrors {
  const errors: FormErrors = {};

  // ----- Customer -----
  checkRequired(errors, "customer.name", form.customer.name, "Customer name", 80);
  checkRequired(errors, "customer.address", form.customer.address, "Customer address", 200);
  checkEmail(errors, "customer.email", form.customer.email);
  checkPhone(errors, "customer.phone", form.customer.phone);
  checkRequired(errors, "customer.memberId", form.customer.memberId, "Member ID", 30);

  // ----- Business -----
  checkRequired(errors, "business.name", form.business.name, "Business name", 80);
  checkRequired(errors, "business.address", form.business.address, "Business address", 200);
  checkEmail(errors, "business.email", form.business.email);
  checkPhone(errors, "business.phone", form.business.phone);

  // ----- Invoice info -----
  checkRequired(errors, "invoice.invoiceNumber", form.invoice.invoiceNumber, "Invoice number", 30);
  checkRequired(errors, "invoice.program", form.invoice.program, "Program/package", 60);

  if (!isValidDate(form.invoice.invoiceDate)) {
    errors["invoice.invoiceDate"] = "Invoice date is required";
  }
  if (!isValidDate(form.invoice.startDate)) {
    errors["invoice.startDate"] = "Start date is required";
  }
  if (!isValidDate(form.invoice.expiryDate)) {
    errors["invoice.expiryDate"] = "Expiry date is required";
  } else if (
    isValidDate(form.invoice.startDate) &&
    Date.parse(form.invoice.expiryDate) < Date.parse(form.invoice.startDate)
  ) {
    errors["invoice.expiryDate"] = "Expiry date cannot be before start date";
  }

  // ----- Financial -----
  const amount = parseMoney(form.financial.amount);
  if (!Number.isFinite(amount)) {
    errors["financial.amount"] = "Enter a valid amount (e.g. 3000 or 2499.50)";
  }

  const discountRaw = form.financial.discount.trim();
  const discount = discountRaw === "" ? 0 : parseMoney(discountRaw);
  if (!Number.isFinite(discount)) {
    errors["financial.discount"] = "Enter a valid discount (e.g. 500)";
  }

  const paidRaw = form.financial.paidAmount.trim();
  const paid = paidRaw === "" ? 0 : parseMoney(paidRaw);
  if (!Number.isFinite(paid)) {
    errors["financial.paidAmount"] = "Enter a valid paid amount (e.g. 2500)";
  }

  if (Number.isFinite(amount) && Number.isFinite(discount)) {
    if (discount > amount) {
      errors["financial.discount"] = "Discount cannot exceed the amount";
    } else if (Number.isFinite(paid) && paid > round2(amount - discount)) {
      errors["financial.paidAmount"] = "Paid amount cannot exceed the final amount";
    }
  }

  // ----- Terms & conditions -----
  if (form.terms.length > MAX_TERMS_SECTIONS) {
    errors["terms"] = `Too many policy sections (max ${MAX_TERMS_SECTIONS})`;
  }

  form.terms.forEach((section, index) => {
    checkRequired(errors, `terms.${index}.heading`, section.heading, "Heading", 80);
    checkRequired(errors, `terms.${index}.description`, section.description, "Description", 1200);
  });

  return errors;
}

/** Returns a copy of the object with every string value trimmed. */
function trimStrings<T extends object>(source: T): T {
  const entries = Object.entries(source).map(([key, value]) => [
    key,
    typeof value === "string" ? value.trim() : value,
  ]);

  return Object.fromEntries(entries) as unknown as T;
}

/** Trims text and converts money strings to numbers for the API. */
export function buildPayload(form: InvoiceFormState): InvoicePayload {
  const discountRaw = form.financial.discount.trim();
  const paidRaw = form.financial.paidAmount.trim();

  return {
    customer: trimStrings(form.customer),
    business: trimStrings(form.business),
    invoice: trimStrings(form.invoice),
    financial: {
      amount: parseMoney(form.financial.amount),
      discount: discountRaw === "" ? 0 : parseMoney(discountRaw),
      paidAmount: paidRaw === "" ? 0 : parseMoney(paidRaw),
    },
    terms: form.terms.map((section) => ({
      id: section.id,
      heading: section.heading.trim(),
      description: section.description.trim(),
    })),
  };
}