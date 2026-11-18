import { create } from 'zustand'
import type { LoadedImage } from '../lib/image'

export type SlotId = 'A' | 'B'

export interface ImageSlotsState {
  slots: Record<SlotId, LoadedImage | null>
  setSlotImage: (slot: SlotId, image: LoadedImage) => void
  clearSlot: (slot: SlotId) => void
}

export const useImageSlotsStore = create<ImageSlotsState>((set) => ({
  slots: { A: null, B: null },
  setSlotImage: (slot, image) =>
    set((state) => ({ slots: { ...state.slots, [slot]: image } })),
  clearSlot: (slot) => set((state) => ({ slots: { ...state.slots, [slot]: null } })),
}))
