import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva'
import { useImageSlotsStore } from '../store/imageSlots'
import { useLayoutModeStore } from '../store/layoutMode'
import { computeLayout } from '../lib/layout'
import { useHtmlImage } from '../lib/useHtmlImage'

const BACKGROUND_COLOR = '#d4d4d4'

export function ComparisonCanvas() {
  const slotA = useImageSlotsStore((state) => state.slots.A)
  const slotB = useImageSlotsStore((state) => state.slots.B)
  const mode = useLayoutModeStore((state) => state.mode)
  const imageA = useHtmlImage(slotA?.dataUrl ?? null)
  const imageB = useHtmlImage(slotB?.dataUrl ?? null)

  if (!slotA || !slotB) return null

  const layout = computeLayout(slotA, slotB, mode)

  return (
    <Stage width={layout.canvas.width} height={layout.canvas.height} className="rounded border border-neutral-300">
      <Layer>
        <Rect x={0} y={0} width={layout.canvas.width} height={layout.canvas.height} fill={BACKGROUND_COLOR} />
        {imageA && (
          <KonvaImage image={imageA} x={layout.a.x} y={layout.a.y} width={layout.a.width} height={layout.a.height} />
        )}
        {imageB && (
          <KonvaImage image={imageB} x={layout.b.x} y={layout.b.y} width={layout.b.width} height={layout.b.height} />
        )}
      </Layer>
    </Stage>
  )
}
