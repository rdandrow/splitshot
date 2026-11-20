import { create } from 'zustand'
import type { NormalizationMode } from '../lib/layout'

export interface LayoutModeState {
  mode: NormalizationMode
  setMode: (mode: NormalizationMode) => void
}

export const useLayoutModeStore = create<LayoutModeState>((set) => ({
  mode: 'match-height',
  setMode: (mode) => set({ mode }),
}))
