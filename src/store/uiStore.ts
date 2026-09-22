import { create } from "zustand";

interface UIState {
  mobileNavOpen: boolean;
  toast: string | null;
  setMobileNavOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  toast: null,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}));
