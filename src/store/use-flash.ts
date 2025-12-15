import { create } from "zustand";

export type Flash = {
	type: "success" | "error" | "info";
	message: string;
};

type FlashStore = {
	flash: Flash | null;
	setFlash: (flash: Flash) => void;
	clear: () => void;
};

export const useFlashStore = create<FlashStore>((set) => ({
	flash: null,
	setFlash: (flash) => set({ flash }),
	clear: () => set({ flash: null }),
}));
