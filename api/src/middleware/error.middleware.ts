import type { NextFunction, Request, Response } from "express";
import { PdfGenerationError } from "../services/pdf.service";

interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express recognises error handlers by their 4-argument signature,
// so `_next` must stay even though it is unused.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    res.end();
    return;
  }

  if (error instanceof PdfGenerationError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const bodyError = error as BodyParserError;

  if (bodyError?.type === "entity.parse.failed") {
    res.status(400).json({ message: "Request body is not valid JSON." });
    return;
  }

  if (bodyError?.type === "entity.too.large") {
    res.status(413).json({ message: "Request body is too large." });
    return;
  }

  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "An unexpected error occurred. Please try again.",
  });
}