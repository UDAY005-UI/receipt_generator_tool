import type { FormErrors, InvoiceInfo } from "@/types/invoice";
import { SectionCard, TextField } from "./ui";

interface InvoiceDetailsProps {
  value: InvoiceInfo;
  errors: FormErrors;
  onChange: (value: InvoiceInfo) => void;
}

export default function InvoiceDetails({
  value,
  errors,
  onChange,
}: InvoiceDetailsProps) {
  const set = <K extends keyof InvoiceInfo>(key: K, next: InvoiceInfo[K]) =>
    onChange({ ...value, [key]: next });

  const numberError = errors["invoice.invoiceNumber"];

  return (
    <SectionCard title="Invoice Information">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Invoice number
          </span>
          <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
            {value.invoiceNumber || (
              <span className="font-normal text-slate-400">
                Auto-generated when you click Generate PDF
              </span>
            )}
          </div>
          {numberError ? (
            <p className="mt-1 text-xs text-red-600">{numberError}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              A new 5-digit number is created every time you generate a PDF.
            </p>
          )}
        </div>

        <TextField
          id="invoice-date"
          label="Invoice date"
          type="date"
          required
          className="sm:col-span-2"
          value={value.invoiceDate}
          onChange={(v) => set("invoiceDate", v)}
          error={errors["invoice.invoiceDate"]}
        />
        <TextField
          id="invoice-start-date"
          label="Start date"
          type="date"
          required
          value={value.startDate}
          onChange={(v) => set("startDate", v)}
          error={errors["invoice.startDate"]}
        />
        <TextField
          id="invoice-expiry-date"
          label="Expiry date"
          type="date"
          required
          value={value.expiryDate}
          onChange={(v) => set("expiryDate", v)}
          error={errors["invoice.expiryDate"]}
        />
      </div>
    </SectionCard>
  );
}