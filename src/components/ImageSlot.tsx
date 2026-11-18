import { useRef, useState, type ChangeEvent, type DragEvent, type ClipboardEvent } from 'react'
import { useImageSlotsStore, type SlotId } from '../store/imageSlots'
import { loadImageFile } from '../lib/image'
import { getImageFileFromDataTransfer } from '../lib/dragDrop'
import { getImageFileFromClipboard } from '../lib/clipboard'

interface ImageSlotProps {
  slot: SlotId
  label: string
}

export function ImageSlot({ slot, label }: ImageSlotProps) {
  const image = useImageSlotsStore((state) => state.slots[slot])
  const setSlotImage = useImageSlotsStore((state) => state.setSlotImage)
  const clearSlot = useImageSlotsStore((state) => state.clearSlot)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function acceptFile(file: File | null) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.')
      return
    }

    try {
      const loaded = await loadImageFile(file)
      setError(null)
      setSlotImage(slot, loaded)
    } catch {
      setError('Could not load that file as an image.')
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (event.dataTransfer.files.length === 0) return

    const imageFile = getImageFileFromDataTransfer(event.dataTransfer)
    if (!imageFile) {
      setError('That file is not an image.')
      return
    }

    void acceptFile(imageFile)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    void acceptFile(getImageFileFromClipboard(event.nativeEvent))
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void acceptFile(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  function handleClear() {
    clearSlot(slot)
    setError(null)
  }

  return (
    <div
      data-testid={`slot-${slot}-dropzone`}
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
      className="flex h-64 w-80 flex-col items-center justify-center rounded border-2 border-dashed border-neutral-300 bg-white p-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <h2 className="mb-2 text-sm font-medium text-neutral-700">{label}</h2>
      {image ? (
        <div className="flex h-full w-full flex-col items-center gap-2 overflow-hidden">
          <img
            src={image.dataUrl}
            alt={`${label} screenshot`}
            className="max-h-40 max-w-full object-contain"
          />
          <p className="truncate text-xs text-neutral-500">{image.name}</p>
          <button type="button" onClick={handleClear} className="text-xs text-blue-600 underline">
            Clear
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500">Paste, drop, or choose a screenshot</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-blue-600 underline"
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label={`Choose file for ${label}`}
            className="sr-only"
            onChange={handleFileInputChange}
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </>
      )}
    </div>
  )
}
