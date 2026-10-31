const STORAGE_KEY = "antariksha:used-invoice-numbers";
const MAX_REMEMBERED = 1000;
const MIN_VALUE = 10000;
const RANGE = 90000; // 10000 to 99999
const MAX_ATTEMPTS = 50;

function randomFiveDigits(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(MIN_VALUE + (buffer[0] % RANGE));
}

function readUsed(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

/** Returns a fresh 5-digit number that this browser has not used before. */
export function generateInvoiceNumber(): string {
  const used = new Set(readUsed());
  let candidate = randomFiveDigits();

  for (let attempt = 0; attempt < MAX_ATTEMPTS && used.has(candidate); attempt++) {
    candidate = randomFiveDigits();
  }

  return candidate;
}

/** Records a number as used so it is not generated again on this browser. */
export function rememberInvoiceNumber(invoiceNumber: string): void {
  try {
    const next = [...readUsed(), invoiceNumber].slice(-MAX_REMEMBERED);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); numbers just won't be remembered.
  }
}