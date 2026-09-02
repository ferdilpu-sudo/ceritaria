"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

interface AdminFilePickerProps {
  label: string;
  hint: string;
  registerProps: UseFormRegisterReturn;
  onFile: (file?: File) => void;
  accept?: string;
}

export function AdminFilePicker({
  label,
  hint,
  registerProps,
  onFile,
  accept = "image/jpeg,image/png,image/webp",
}: AdminFilePickerProps) {
  const inputId = `admin-file-${registerProps.name}`;

  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-[var(--text)]">{label} <span className="font-normal text-[var(--muted)]">(opsional)</span></p>
      <label
        htmlFor={inputId}
        className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-center transition active:bg-zinc-100 sm:hover:border-red-300 sm:hover:bg-red-50/40"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-black text-red-600 shadow-sm">+</span>
        <span className="mt-2 text-sm font-bold text-[var(--text)]">Pilih gambar</span>
        <span className="mt-1 text-[11px] leading-4 text-[var(--muted)]">{hint}</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        {...registerProps}
        onChange={(event) => {
          void registerProps.onChange(event);
          onFile(event.target.files?.[0]);
        }}
      />
    </div>
  );
}
