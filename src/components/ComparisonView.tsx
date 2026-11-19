import { useImageSlotsStore } from '../store/imageSlots'
import { useLayoutModeStore } from '../store/layoutMode'
import type { NormalizationMode } from '../lib/layout'
import { ComparisonCanvas } from './ComparisonCanvas'

const MODE_OPTIONS: { value: NormalizationMode; label: string }[] = [
  { value: 'match-height', label: 'Match height' },
  { value: 'match-width', label: 'Match width' },
  { value: 'fit', label: 'Fit (letterbox)' },
  { value: 'stretch', label: 'Stretch' },
]

export function ComparisonView() {
  const hasBothImages = useImageSlotsStore((state) => Boolean(state.slots.A && state.slots.B))
  const mode = useLayoutModeStore((state) => state.mode)
  const setMode = useLayoutModeStore((state) => state.setMode)

  if (!hasBothImages) return null

  return (
    <section className="mx-auto flex flex-col items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        Normalization
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as NormalizationMode)}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
        >
          {MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <ComparisonCanvas />
    </section>
  )
}
