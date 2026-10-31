const DEFAULT_INTERVAL_MINUTES = 10;
const MIN_INTERVAL_MINUTES = 1;
// Render spins free services down after 15 minutes idle, so stay below that.
const MAX_INTERVAL_MINUTES = 14;
const REQUEST_TIMEOUT_MS = 15_000;

export function startKeepAlive(): void {
  const baseUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;

  if (!baseUrl) {
    console.log(
      "[keep-alive] Disabled (no KEEP_ALIVE_URL or RENDER_EXTERNAL_URL set)."
    );
    return;
  }

  const requestedMinutes =
    Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || DEFAULT_INTERVAL_MINUTES;
  const minutes = Math.min(
    Math.max(requestedMinutes, MIN_INTERVAL_MINUTES),
    MAX_INTERVAL_MINUTES
  );
  const intervalMs = minutes * 60_000;
  const target = `${baseUrl.replace(/\/+$/, "")}/api/health`;

  const ping = async (): Promise<void> => {
    try {
      const response = await fetch(target, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      console.log(`[keep-alive] ${target} responded with ${response.status}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      console.warn(`[keep-alive] Ping failed: ${reason}`);
    }
  };

  setInterval(ping, intervalMs);
  console.log(`[keep-alive] Pinging ${target} every ${minutes} minute(s).`);
}