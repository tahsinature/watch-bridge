/** Trigger a browser download of `data` as a formatted JSON file. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Filename-safe timestamp, e.g. "2026-07-26". */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
