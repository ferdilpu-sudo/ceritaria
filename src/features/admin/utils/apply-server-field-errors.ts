import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function applyServerFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors?: Record<string, string>,
) {
  if (!fieldErrors) return;
  Object.entries(fieldErrors).forEach(([name, message]) => {
    setError(name as Path<T>, { type: "server", message });
  });
}
