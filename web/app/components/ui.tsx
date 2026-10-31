import type { HTMLAttributes, ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface BaseFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
}

function inputClasses(hasError: boolean): string {
  return [
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-300 focus:border-slate-900 focus:ring-slate-200",
  ].join(" ");
}

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: Pick<
  BaseFieldProps,
  "id" | "label" | "required" | "error" | "hint" | "className"
> & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel" | "date";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  hint,
  className,
  type = "text",
  inputMode,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClasses(Boolean(error))}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends BaseFieldProps {
  rows?: number;
  maxLength?: number;
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  hint,
  className,
  rows = 3,
  maxLength,
}: TextAreaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClasses(Boolean(error))} resize-y`}
      />
    </FieldShell>
  );
}