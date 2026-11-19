import { describe, expect, it, beforeEach } from 'vitest'
import { useImageSlotsStore } from './imageSlots'

const sampleImage = {
  name: 'shot.png',
  dataUrl: 'data:image/png;base64,abc',
  width: 100,
  height: 50,
}

describe('useImageSlotsStore', () => {
  beforeEach(() => {
    useImageSlotsStore.setState({ slots: { A: null, B: null } })
  })

  it('starts with both slots empty', () => {
    expect(useImageSlotsStore.getState().slots).toEqual({ A: null, B: null })
  })

  it('sets the image for a given slot without touching the other slot', () => {
    useImageSlotsStore.getState().setSlotImage('A', sampleImage)

    const { slots } = useImageSlotsStore.getState()
    expect(slots.A).toEqual(sampleImage)
    expect(slots.B).toBeNull()
  })

  it('replaces an existing image in a slot', () => {
    useImageSlotsStore.getState().setSlotImage('A', sampleImage)
    const replacement = { ...sampleImage, name: 'other.png' }

    useImageSlotsStore.getState().setSlotImage('A', replacement)

    expect(useImageSlotsStore.getState().slots.A).toEqual(replacement)
  })

  it('clears a slot', () => {
    useImageSlotsStore.getState().setSlotImage('B', sampleImage)

    useImageSlotsStore.getState().clearSlot('B')

    expect(useImageSlotsStore.getState().slots.B).toBeNull()
  })
})
