"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface AdminFilePickerProps {
  label: string;
  hint: string;
  registerProps: UseFormRegisterReturn;
  onFile: (file?: File) => void;
  previewSrc?: string | null;
  accept?: string;
}

export function AdminFilePicker({
  label,
  hint,
  registerProps,
  onFile,
  previewSrc = null,
  accept = "image/jpeg,image/png,image/webp",
}: AdminFilePickerProps) {
  const inputId = `admin-file-${registerProps.name}`;
  const [fileName, setFileName] = useState<string | null>(null);
  const hasImage = Boolean(previewSrc);

  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-[var(--text)]">
        {label} <span className="font-normal text-[var(--muted)]">(opsional)</span>
      </p>
      <label
        htmlFor={inputId}
        className="mt-2 flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 transition active:bg-zinc-100 sm:hover:border-red-300 sm:hover:bg-red-50/40"
      >
        {hasImage ? (
          <span
            role="img"
            aria-label={`Preview ${label}`}
            className="h-16 w-16 shrink-0 rounded-xl border border-[var(--border)] bg-zinc-100 bg-cover bg-center shadow-sm"
            style={{ backgroundImage: `url(${JSON.stringify(previewSrc)})` }}
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xl font-black text-red-600 shadow-sm">+</span>
        )}
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-bold text-[var(--text)]">{hasImage ? "Ganti gambar" : "Pilih gambar"}</span>
          <span className="mt-1 block break-words text-[11px] leading-4 text-[var(--muted)]">
            {fileName ? `Dipilih: ${fileName}` : hasImage ? "Gambar siap digunakan." : hint}
          </span>
        </span>
        {hasImage && <span className="shrink-0 text-xs font-bold text-emerald-700">✓ Siap</span>}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        {...registerProps}
        onChange={(event) => {
          const file = event.target.files?.[0];
          void registerProps.onChange(event);
          setFileName(file?.name ?? null);
          onFile(file);
        }}
      />
    </div>
  );
}
