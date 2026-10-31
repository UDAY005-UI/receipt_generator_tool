import type { NextFunction, Request, Response } from "express";
import { invoiceSchema } from "../validation/invoice.schema";
import { generateInvoicePdf } from "../services/pdf.service";

/** Keeps the filename safe for the Content-Disposition header. */
const toSafeFilename = (invoiceNumber: string): string => {
  const cleaned = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  return `invoice-${cleaned || "document"}.pdf`;
};

export async function generatePdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = invoiceSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed. Please check the highlighted fields.",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const pdfBuffer = await generatePdfBuffer(parsed.data);
    const filename = toSafeFilename(parsed.data.invoice.invoiceNumber);

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.setHeader("Cache-Control", "no-store");
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

async function generatePdfBuffer(
  data: Parameters<typeof generateInvoicePdf>[0]
): Promise<Buffer> {
  return generateInvoicePdf(data);
}