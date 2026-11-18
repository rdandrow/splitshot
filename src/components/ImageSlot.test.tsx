import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageSlot } from './ImageSlot'
import { useImageSlotsStore } from '../store/imageSlots'

class FakeImage {
  width = 0
  height = 0
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_value: string) {
    this.width = 200
    this.height = 100
    queueMicrotask(() => this.onload?.())
  }
}

function makeImageFile(name = 'shot.png') {
  return new File(['fake-bytes'], name, { type: 'image/png' })
}

function makeTextFile(name = 'notes.txt') {
  return new File(['hello'], name, { type: 'text/plain' })
}

describe('ImageSlot', () => {
  const originalImage = globalThis.Image

  beforeEach(() => {
    // @ts-expect-error -- test double for the DOM Image constructor
    globalThis.Image = FakeImage
    useImageSlotsStore.setState({ slots: { A: null, B: null } })
  })

  afterEach(() => {
    globalThis.Image = originalImage
  })

  it('shows a placeholder prompt when empty', () => {
    render(<ImageSlot slot="A" label="Expected" />)

    expect(screen.getByText(/expected/i)).toBeInTheDocument()
    expect(screen.getByText(/paste, drop, or choose/i)).toBeInTheDocument()
  })

  it('loads a file chosen via the file picker into the slot', async () => {
    const user = userEvent.setup()
    render(<ImageSlot slot="A" label="Expected" />)

    const input = screen.getByLabelText(/expected/i, { selector: 'input[type="file"]' })
    await user.upload(input, makeImageFile())

    const preview = await screen.findByRole('img', { name: /expected/i })
    expect(preview).toHaveAttribute('src', expect.stringContaining('data:'))
    expect(useImageSlotsStore.getState().slots.A).not.toBeNull()
  })

  it('loads a dropped image file into the slot', async () => {
    render(<ImageSlot slot="B" label="Actual" />)
    const dropzone = screen.getByTestId('slot-B-dropzone')
    const file = makeImageFile('dropped.png')

    fireDrop(dropzone, [file])

    const preview = await screen.findByRole('img', { name: /actual/i })
    expect(preview).toBeInTheDocument()
    expect(useImageSlotsStore.getState().slots.B?.name).toBe('dropped.png')
  })

  it('loads a pasted image into the slot', async () => {
    render(<ImageSlot slot="A" label="Expected" />)
    const dropzone = screen.getByTestId('slot-A-dropzone')
    const file = makeImageFile('pasted.png')

    firePaste(dropzone, [{ kind: 'file', type: 'image/png', getAsFile: () => file }])

    const preview = await screen.findByRole('img', { name: /expected/i })
    expect(preview).toBeInTheDocument()
    expect(useImageSlotsStore.getState().slots.A?.name).toBe('pasted.png')
  })

  it('ignores a dropped non-image file and keeps the placeholder', async () => {
    render(<ImageSlot slot="A" label="Expected" />)
    const dropzone = screen.getByTestId('slot-A-dropzone')

    fireDrop(dropzone, [makeTextFile()])

    expect(await within(dropzone).findByText(/not an image/i)).toBeInTheDocument()
    expect(useImageSlotsStore.getState().slots.A).toBeNull()
  })

  it('clears a filled slot', async () => {
    const user = userEvent.setup()
    render(<ImageSlot slot="A" label="Expected" />)
    const input = screen.getByLabelText(/expected/i, { selector: 'input[type="file"]' })
    await user.upload(input, makeImageFile())
    await screen.findByRole('img', { name: /expected/i })

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(screen.queryByRole('img', { name: /expected/i })).not.toBeInTheDocument()
    expect(useImageSlotsStore.getState().slots.A).toBeNull()
  })
})

function fireDrop(element: Element, files: File[]) {
  const dataTransfer = { files } as unknown as DataTransfer
  element.dispatchEvent(
    Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer }),
  )
}

function firePaste(
  element: Element,
  items: Array<{ kind: string; type: string; getAsFile: () => File | null }>,
) {
  const clipboardData = { items } as unknown as DataTransfer
  element.dispatchEvent(
    Object.assign(new Event('paste', { bubbles: true, cancelable: true }), { clipboardData }),
  )
}
