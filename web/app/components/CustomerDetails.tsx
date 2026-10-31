import type {
  CustomerDetails as CustomerData,
  FormErrors,
} from "@/types/invoice";
import { SectionCard, TextAreaField, TextField } from "./ui";

interface CustomerDetailsProps {
  value: CustomerData;
  errors: FormErrors;
  onChange: (value: CustomerData) => void;
}

export default function CustomerDetails({
  value,
  errors,
  onChange,
}: CustomerDetailsProps) {
  const set = <K extends keyof CustomerData>(key: K, next: CustomerData[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <SectionCard title="Customer Details" description="Who this invoice is billed to.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="customer-name"
          label="Customer name"
          required
          value={value.name}
          onChange={(v) => set("name", v)}
          error={errors["customer.name"]}
          placeholder="e.g. Rahul Sharma"
        />
        <TextField
          id="customer-member-id"
          label="Member ID"
          required
          value={value.memberId}
          onChange={(v) => set("memberId", v)}
          error={errors["customer.memberId"]}
          placeholder="e.g. 337"
        />
        <TextAreaField
          id="customer-address"
          label="Customer address"
          required
          className="sm:col-span-2"
          value={value.address}
          onChange={(v) => set("address", v)}
          error={errors["customer.address"]}
          placeholder="Street, area, city"
          rows={2}
        />
        <TextField
          id="customer-email"
          label="Customer email"
          type="email"
          value={value.email}
          onChange={(v) => set("email", v)}
          error={errors["customer.email"]}
          placeholder="Optional"
        />
        <TextField
          id="customer-phone"
          label="Customer phone"
          type="tel"
          required
          value={value.phone}
          onChange={(v) => set("phone", v)}
          error={errors["customer.phone"]}
          placeholder="e.g. 9876543210"
        />
      </div>
    </SectionCard>
  );
}