import puppeteer, { type Browser } from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { renderInvoiceHtml } from "../templates/invoice.template";
import { computeFinancials, type ValidatedInvoice } from "../validation/invoice.schema";
import type { InvoiceRenderData } from "../types/invoice";

/** A4 at 96 DPI is 794 x 1123 px (297mm = 1122.52px). */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1122;
/** Small tolerance so sub-pixel rounding doesn't trigger false overflows. */
const OVERFLOW_TOLERANCE_PX = 1;

export class PdfGenerationError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "PdfGenerationError";
    this.statusCode = statusCode;
  }
}

export async function generateInvoicePdf(
  input: ValidatedInvoice
): Promise<Buffer> {
  const renderData: InvoiceRenderData = {
    ...input,
    financial: computeFinancials(input.financial),
  };

  const html = renderInvoiceHtml(renderData);

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX });
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("print");

    // Make sure fonts are ready before measuring layout.
    await page.evaluate(() => document.fonts.ready);

    // 1. Overflow check: measure the content box against the A4 height.
    const contentHeight = await page.evaluate(() => {
      const el = document.getElementById("page");
      return el ? el.scrollHeight : 0;
    });

    if (contentHeight === 0) {
      throw new PdfGenerationError("Failed to render the invoice template.");
    }

    if (contentHeight > A4_HEIGHT_PX + OVERFLOW_TOLERANCE_PX) {
      const overflowPx = Math.ceil(contentHeight - A4_HEIGHT_PX);
      throw new PdfGenerationError(
        `The content is too long to fit on one A4 page (about ${overflowPx}px over). ` +
          `Shorten the terms & conditions or remove a section and try again.`,
        422
      );
    }

    // 2. Generate the PDF, restricted to the first page.
    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
      pageRanges: "1",
    });

    // 3. Final safety net: confirm the output really is a single page.
    const pdfDoc = await PDFDocument.load(pdfBytes);
    if (pdfDoc.getPageCount() !== 1) {
      throw new PdfGenerationError(
        "The generated PDF did not fit on one page. Shorten the content and try again.",
        422
      );
    }

    return Buffer.from(pdfBytes);
  } catch (error) {
    if (error instanceof PdfGenerationError) {
      throw error;
    }
    console.error("PDF generation failed:", error);
    throw new PdfGenerationError(
      "Something went wrong while generating the PDF. Please try again.",
      500
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}