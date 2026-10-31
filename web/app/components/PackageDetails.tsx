import {
  PACKAGE_CATEGORIES,
  PACKAGE_CATEGORY_LABELS,
} from "@/types/invoice";
import type {
  FormErrors,
  InvoiceInfo,
  PackageCategory,
} from "@/types/invoice";
import { SectionCard, TextField } from "./ui";

interface PackageDetailsProps {
  invoice: InvoiceInfo;
  amount: string;
  errors: FormErrors;
  onInvoiceChange: (value: InvoiceInfo) => void;
  onAmountChange: (value: string) => void;
}

export default function PackageDetails({
  invoice,
  amount,
  errors,
  onInvoiceChange,
  onAmountChange,
}: PackageDetailsProps) {
  const categoryError = errors["invoice.packageCategory"];

  return (
    <SectionCard
      title="Package"
      description="The package amount is used as the invoice amount."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="package-category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Package category<span className="ml-0.5 text-red-500">*</span>
          </label>
          <select
            id="package-category"
            value={invoice.packageCategory}
            onChange={(event) =>
              onInvoiceChange({
                ...invoice,
                packageCategory: event.target.value as PackageCategory | "",
              })
            }
            aria-invalid={categoryError ? true : undefined}
            aria-describedby={categoryError ? "package-category-error" : undefined}
            className={[
              "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900",
              "focus:outline-none focus:ring-2",
              categoryError
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-200",
            ].join(" ")}
          >
            <option value="">Select a category</option>
            {PACKAGE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {PACKAGE_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {categoryError ? (
            <p id="package-category-error" className="mt-1 text-xs text-red-600">
              {categoryError}
            </p>
          ) : null}
        </div>

        <TextField
          id="package-name"
          label="Package name"
          required
          value={invoice.packageName}
          onChange={(v) => onInvoiceChange({ ...invoice, packageName: v })}
          error={errors["invoice.packageName"]}
          placeholder="e.g. Starter Reels Pack"
        />
        <TextField
          id="package-amount"
          label="Package amount"
          required
          inputMode="decimal"
          value={amount}
          onChange={onAmountChange}
          error={errors["financial.amount"]}
          placeholder="e.g. 3000"
        />
      </div>
    </SectionCard>
  );
}