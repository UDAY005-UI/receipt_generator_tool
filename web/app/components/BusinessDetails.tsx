import type {
  BusinessDetails as BusinessData,
  FormErrors,
} from "@/types/invoice";
import { SectionCard, TextAreaField, TextField } from "./ui";

interface BusinessDetailsProps {
  value: BusinessData;
  errors: FormErrors;
  onChange: (value: BusinessData) => void;
}

export default function BusinessDetails({
  value,
  errors,
  onChange,
}: BusinessDetailsProps) {
  const set = <K extends keyof BusinessData>(key: K, next: BusinessData[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <SectionCard title="Business Details" description="The business issuing this invoice.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="business-name"
          label="Business / company name"
          required
          className="sm:col-span-2"
          value={value.name}
          onChange={(v) => set("name", v)}
          error={errors["business.name"]}
          placeholder="e.g. Your Studio Name"
        />
        <TextAreaField
          id="business-address"
          label="Business address"
          required
          className="sm:col-span-2"
          value={value.address}
          onChange={(v) => set("address", v)}
          error={errors["business.address"]}
          placeholder="Street, area, city, state"
          rows={2}
        />
        <TextField
          id="business-email"
          label="Business email"
          type="email"
          value={value.email}
          onChange={(v) => set("email", v)}
          error={errors["business.email"]}
          placeholder="Optional"
        />
        <TextField
          id="business-phone"
          label="Business phone"
          type="tel"
          required
          value={value.phone}
          onChange={(v) => set("phone", v)}
          error={errors["business.phone"]}
          placeholder="e.g. 9876543210"
        />
      </div>
    </SectionCard>
  );
}