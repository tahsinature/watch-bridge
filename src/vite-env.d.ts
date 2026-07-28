/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STATE_PORT_API_URL?: string;
  readonly VITE_STATE_PORT_DASHBOARD_URL?: string;
}

/** Current package version, injected by Vite when the app is built. */
declare const __APP_VERSION__: string;
