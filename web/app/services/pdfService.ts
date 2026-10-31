import axios from "axios";
import type {
  ApiErrorBody,
  FormErrors,
  InvoicePayload,
} from "@/types/invoice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class PdfRequestError extends Error {
  public readonly fieldErrors: FormErrors;

  constructor(message: string, fieldErrors: FormErrors = {}) {
    super(message);
    this.name = "PdfRequestError";
    this.fieldErrors = fieldErrors;
  }
}

/** Error bodies arrive as a Blob (because responseType is "blob"), so parse them. */
async function readErrorBody(data: unknown): Promise<ApiErrorBody | null> {
  try {
    if (data instanceof Blob) {
      return JSON.parse(await data.text()) as ApiErrorBody;
    }
    if (data && typeof data === "object") {
      return data as ApiErrorBody;
    }
  } catch {
    // Body was not JSON; fall through to a generic message.
  }
  return null;
}

export async function generatePdf(payload: InvoicePayload): Promise<Blob> {
  try {
    const response = await axios.post<Blob>(
      `${API_BASE_URL}/api/pdf/generate`,
      payload,
      {
        responseType: "blob",
        timeout: 60_000,
        headers: { "Content-Type": "application/json" },
      }
    );

    return new Blob([response.data], { type: "application/pdf" });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const body = await readErrorBody(error.response.data);

        const fieldErrors: FormErrors = {};
        body?.errors?.forEach((issue) => {
          // Keep the first message per field.
          if (!fieldErrors[issue.path]) {
            fieldErrors[issue.path] = issue.message;
          }
        });

        throw new PdfRequestError(
          body?.message ??
            `The server responded with an error (status ${error.response.status}).`,
          fieldErrors
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new PdfRequestError(
          "The request timed out. Please try again."
        );
      }

      throw new PdfRequestError(
        "Cannot reach the PDF server. Make sure the backend is running on " +
          API_BASE_URL +
          "."
      );
    }

    throw new PdfRequestError("An unexpected error occurred. Please try again.");
  }
}