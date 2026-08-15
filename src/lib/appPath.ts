const ASSET_DIRECTORY = "/assets/";

/**
 * Relative production assets reveal the directory where WatchBridge is
 * mounted, while development always runs from Vite's root.
 */
export function deriveAppBasePath(
  entryScriptSource: string | null,
  isDevelopment: boolean,
): string {
  if (isDevelopment || !entryScriptSource) return "/";

  const entryPath = new URL(
    entryScriptSource,
    "https://watchbridge.invalid/",
  ).pathname;
  const assetsIndex = entryPath.lastIndexOf(ASSET_DIRECTORY);
  if (assetsIndex < 0) return "/";

  return `${entryPath.slice(0, assetsIndex)}/`;
}

export function matchesAppPath(pathname: string, basePath: string): boolean {
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const baseWithoutSlash = normalizedBase.slice(0, -1);

  return (
    pathname === normalizedBase ||
    (baseWithoutSlash.length > 0 && pathname === baseWithoutSlash) ||
    pathname === `${normalizedBase}index.html`
  );
}

export function getAppBasePath(): string {
  const entryScript = document.querySelector<HTMLScriptElement>(
    'script[type="module"][src]',
  );
  return deriveAppBasePath(entryScript?.src ?? null, import.meta.env.DEV);
}

export function isCurrentAppPath(): boolean {
  return matchesAppPath(window.location.pathname, getAppBasePath());
}
