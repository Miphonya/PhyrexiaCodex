import { create } from "zustand";
// Deliberately no persist middleware: keys never enter IndexedDB, backups or Web Storage.
export const useVisionSession = create<{
  apiKey: string;
  setKey: (key: string) => void;
  clear: () => void;
}>((set) => ({
  apiKey: "",
  setKey: (apiKey) => set({ apiKey: apiKey.trim() }),
  clear: () => set({ apiKey: "" }),
}));
