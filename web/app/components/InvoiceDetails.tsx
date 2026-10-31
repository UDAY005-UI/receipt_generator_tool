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

  return (
    <SectionCard title="Invoice Information">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="invoice-number"
          label="Invoice number"
          required
          value={value.invoiceNumber}
          onChange={(v) => set("invoiceNumber", v)}
          error={errors["invoice.invoiceNumber"]}
          placeholder="e.g. INV3837"
        />
        <TextField
          id="invoice-date"
          label="Invoice date"
          type="date"
          required
          value={value.invoiceDate}
          onChange={(v) => set("invoiceDate", v)}
          error={errors["invoice.invoiceDate"]}
        />
        <TextField
          id="invoice-program"
          label="Program / package"
          required
          className="sm:col-span-2"
          value={value.program}
          onChange={(v) => set("program", v)}
          error={errors["invoice.program"]}
          placeholder="e.g. 3 months"
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