"use client";

import { useState } from "react";

export function AdminPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      Password
      <span className="relative mt-2 block">
        <input
          type={visible ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
              <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.5 4.1 9.5 5.5a4 4 0 0 1 0 5c-.5.7-1.2 1.5-2.1 2.3" />
              <path d="M6.2 6.2C4.3 7.5 3 9.2 2.5 10a4 4 0 0 0 0 4c1 1.9 4.4 6 9.5 6 1.2 0 2.3-.2 3.3-.6" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M2.5 10a4 4 0 0 0 0 4c1 1.9 4.4 6 9.5 6s8.5-4.1 9.5-6a4 4 0 0 0 0-4C20.5 8.1 17.1 4 12 4S3.5 8.1 2.5 10Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}
