"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-white p-6 text-[#091E42]">
        <div className="max-w-md rounded-xl border border-[#DFE1E6] p-6 shadow-lg text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-[#44546F] mb-4">
            An unexpected error occurred in the clinical application shell.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-[#0C66E4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052CC]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
