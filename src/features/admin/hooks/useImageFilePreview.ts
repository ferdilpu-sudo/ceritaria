"use client";

import { useState } from "react";

export function useImageFilePreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function readFile(file?: File) {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  return { previewUrl, readFile };
}
