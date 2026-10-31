import type { FinancialFormState, FormErrors } from "@/types/invoice";
import { computeFinancials } from "@/lib/invoiceUtils";
import { SectionCard, TextField } from "./ui";

interface FinancialDetailsProps {
  value: FinancialFormState;
  errors: FormErrors;
  onChange: (value: FinancialFormState) => void;
}

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

function ReadOnlyRow({
  label,
  amount,
  emphasis,
  tone,
}: {
  label: string;
  amount: number;
  emphasis?: boolean;
  tone?: "neutral" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "success"
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div
      className={`flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 ${
        emphasis ? "ring-1 ring-slate-200" : ""
      }`}
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`text-sm tabular-nums ${toneClass} ${
          emphasis ? "font-bold" : "font-medium"
        }`}
      >
        {formatMoney(amount)}
      </span>
    </div>
  );
}

export default function FinancialDetails({
  value,
  errors,
  onChange,
}: FinancialDetailsProps) {
  const set = <K extends keyof FinancialFormState>(
    key: K,
    next: FinancialFormState[K]
  ) => onChange({ ...value, [key]: next });

  const summary = computeFinancials(value);
  const dueTone = summary.dueAmount > 0 ? "danger" : "success";

  return (
    <SectionCard
      title="Financial Details"
      description="Subtotal, final amount and due amount are calculated automatically."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id="financial-amount"
          label="Amount"
          required
          inputMode="decimal"
          value={value.amount}
          onChange={(v) => set("amount", v)}
          error={errors["financial.amount"]}
          placeholder="e.g. 3000"
        />
        <TextField
          id="financial-discount"
          label="Discount"
          inputMode="decimal"
          value={value.discount}
          onChange={(v) => set("discount", v)}
          error={errors["financial.discount"]}
          placeholder="e.g. 500"
          hint="Leave empty for no discount"
        />
        <TextField
          id="financial-paid"
          label="Paid amount"
          inputMode="decimal"
          value={value.paidAmount}
          onChange={(v) => set("paidAmount", v)}
          error={errors["financial.paidAmount"]}
          placeholder="e.g. 2500"
          hint="Leave empty if nothing is paid"
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <ReadOnlyRow label="Subtotal" amount={summary.subtotal} />
        <ReadOnlyRow label="Final amount" amount={summary.finalAmount} />
        <ReadOnlyRow
          label="Due amount"
          amount={summary.dueAmount}
          emphasis
          tone={dueTone}
        />
      </div>
    </SectionCard>
  );
}