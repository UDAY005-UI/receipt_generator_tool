"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import BusinessDetails from "@/components/BusinessDetails";
import CustomerDetails from "@/components/CustomerDetails";
import FinancialDetails from "@/components/FinancialDetails";
import GenerateButton from "@/components/GenerateButton";
import InvoiceDetails from "@/components/InvoiceDetails";
import TermsConditions from "@/components/TermsConditions";
import { createDefaultInvoice } from "@/lib/defaults"
import { buildPayload, validateInvoice } from "@/lib/invoiceUtils"
import { PdfRequestError, generatePdf } from "@/services/pdfService";
import type { FormErrors, InvoiceFormState } from "@/types/invoice";

const toFilename = (invoiceNumber: string): string => {
  const cleaned = invoiceNumber.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return `invoice-${cleaned || "document"}.pdf`;
};

export default function HomePage() {
  const [form, setForm] = useState<InvoiceFormState>(createDefaultInvoice);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("invoice.pdf");

  const urlRef = useRef<string | null>(null);

  const clearPdf = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setDownloadUrl(null);
  }, []);

  // Release the Blob URL when leaving the page.
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const update = <K extends keyof InvoiceFormState>(
    key: K,
    value: InvoiceFormState[K]
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    // Any edit makes the previously generated PDF stale.
    clearPdf();
  };

  const focusFirstError = () => {
    // Wait for React to render the error state first.
    window.setTimeout(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus({ preventScroll: true });
      }
    }, 50);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;

    clearPdf();
    setApiError(null);

    const validationErrors = validateInvoice(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setApiError("Please fix the highlighted fields and try again.");
      focusFirstError();
      return;
    }

    setIsGenerating(true);

    try {
      const blob = await generatePdf(buildPayload(form));
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setDownloadUrl(url);
      setDownloadFilename(toFilename(form.invoice.invoiceNumber));
    } catch (error) {
      if (error instanceof PdfRequestError) {
        setApiError(error.message);
        if (Object.keys(error.fieldErrors).length > 0) {
          setErrors(error.fieldErrors);
          focusFirstError();
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Antariksha
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Invoice Generator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Fill in the details below to generate a one-page A4 invoice PDF.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <CustomerDetails
          value={form.customer}
          errors={errors}
          onChange={(value) => update("customer", value)}
        />

        <BusinessDetails
          value={form.business}
          errors={errors}
          onChange={(value) => update("business", value)}
        />

        <InvoiceDetails
          value={form.invoice}
          errors={errors}
          onChange={(value) => update("invoice", value)}
        />

        <FinancialDetails
          value={form.financial}
          errors={errors}
          onChange={(value) => update("financial", value)}
        />

        <TermsConditions
          sections={form.terms}
          errors={errors}
          onChange={(value) => update("terms", value)}
        />

        {apiError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {apiError}
          </div>
        ) : null}

        <GenerateButton
          isGenerating={isGenerating}
          downloadUrl={downloadUrl}
          downloadFilename={downloadFilename}
        />
      </form>
    </main>
  );
}