interface GenerateButtonProps {
  isGenerating: boolean;
  downloadUrl: string | null;
  downloadFilename: string;
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function GenerateButton({
  isGenerating,
  downloadUrl,
  downloadFilename,
}: GenerateButtonProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating PDF…
            </>
          ) : (
            "Generate PDF"
          )}
        </button>

        {downloadUrl && !isGenerating ? (
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            Download PDF
          </a>
        ) : null}
      </div>

      {downloadUrl && !isGenerating ? (
        <p className="mt-3 text-sm text-emerald-700">
          Your one-page A4 invoice is ready. Editing any field will require
          generating it again.
        </p>
      ) : null}
    </div>
  );
}