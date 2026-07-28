import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error";

export interface ToastDetails {
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
}

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  details?: ToastDetails;
}

interface ToastState {
  toasts: ToastItem[];
  push: (
    message: string,
    variant?: ToastVariant,
    details?: ToastDetails,
  ) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = "default", details) => {
    const id = ++counter;
    set((s) => ({
      toasts: [...s.toasts, { id, message, variant, details }],
    }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, details?.image ? 4200 : 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Fire-and-forget toast usable from anywhere (event handlers, async code). */
export const toast = (
  message: string,
  variant?: ToastVariant,
  details?: ToastDetails,
) => useToasts.getState().push(message, variant, details);
