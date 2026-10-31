const DEFAULT_LOGO_URL =
  "https://res.cloudinary.com/dthpzuhja/image/upload/v1793444692/antariksha_lg1yg3.png";

const LOGO_URL = process.env.LOGO_URL || DEFAULT_LOGO_URL;
const FETCH_TIMEOUT_MS = 15_000;

let cachedDataUri: string | null = null;

/** Downloads the logo once and keeps it in memory as a base64 data URI. */
export async function preloadLogo(): Promise<void> {
  try {
    const response = await fetch(LOGO_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());

    cachedDataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
    console.log(
      `[assets] Logo loaded (${Math.round(buffer.length / 1024)} KB) from ${LOGO_URL}`
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.warn(
      `[assets] Could not preload logo (${reason}). The browser will load the URL directly.`
    );
  }
}

/**
 * Returns the embedded data URI when the logo was preloaded,
 * otherwise the public URL itself (Puppeteer will fetch it while rendering).
 */
export function getLogoDataUri(): string | null {
  return cachedDataUri ?? LOGO_URL;
}