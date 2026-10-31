import type { FormErrors, PolicySection } from "@/types/invoice";
import { createId } from "@/lib/defaults"
import { MAX_TERMS_SECTIONS } from "@/lib/invoiceUtils";
import { SectionCard, TextAreaField, TextField } from "./ui";

interface TermsConditionsProps {
  sections: PolicySection[];
  errors: FormErrors;
  onChange: (sections: PolicySection[]) => void;
}

export default function TermsConditions({
  sections,
  errors,
  onChange,
}: TermsConditionsProps) {
  const updateSection = (
    index: number,
    patch: Partial<Omit<PolicySection, "id">>
  ) => {
    onChange(
      sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section
      )
    );
  };

  const deleteSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const addSection = () => {
    onChange([...sections, { id: createId(), heading: "", description: "" }]);
  };

  const atLimit = sections.length >= MAX_TERMS_SECTIONS;

  return (
    <SectionCard
      title="Terms & Conditions"
      description="Sections are numbered automatically. Everything must fit on one A4 page, so keep the text concise."
    >
      {errors["terms"] ? (
        <p className="mb-3 text-sm text-red-600">{errors["terms"]}</p>
      ) : null}

      {sections.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No sections yet. Add one below, or generate the invoice without terms.
        </p>
      ) : (
        <ul className="space-y-4">
          {sections.map((section, index) => (
            <li
              key={section.id}
              className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSection(index)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  Delete section
                </button>
              </div>

              <div className="space-y-3">
                <TextField
                  id={`terms-${section.id}-heading`}
                  label="Heading"
                  required
                  value={section.heading}
                  onChange={(v) => updateSection(index, { heading: v })}
                  error={errors[`terms.${index}.heading`]}
                  placeholder="e.g. Payment & Fees"
                />
                <TextAreaField
                  id={`terms-${section.id}-description`}
                  label="Description"
                  required
                  rows={3}
                  value={section.description}
                  onChange={(v) => updateSection(index, { description: v })}
                  error={errors[`terms.${index}.description`]}
                  placeholder="Write the policy text. Use a new line for each point."
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={addSection}
          disabled={atLimit}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add policy section
        </button>
        <span className="text-xs text-slate-400">
          {sections.length} / {MAX_TERMS_SECTIONS} sections
        </span>
      </div>
    </SectionCard>
  );
}