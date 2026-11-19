import { describe, expect, it } from 'vitest'
import { getImageFileFromClipboard } from './clipboard'

function makeFile(name: string, type: string) {
  return new File(['x'], name, { type })
}

function makeClipboardEvent(items: Array<{ kind: string; type: string; file: File | null }>) {
  return {
    clipboardData: {
      items: items.map((item) => ({
        kind: item.kind,
        type: item.type,
        getAsFile: () => item.file,
      })),
    },
  } as unknown as ClipboardEvent
}

describe('getImageFileFromClipboard', () => {
  it('returns the first image file among the clipboard items', () => {
    const imageFile = makeFile('shot.png', 'image/png')
    const event = makeClipboardEvent([
      { kind: 'string', type: 'text/plain', file: null },
      { kind: 'file', type: 'image/png', file: imageFile },
    ])

    expect(getImageFileFromClipboard(event)).toBe(imageFile)
  })

  it('returns null when there is no image item', () => {
    const event = makeClipboardEvent([{ kind: 'string', type: 'text/plain', file: null }])

    expect(getImageFileFromClipboard(event)).toBeNull()
  })

  it('returns null when clipboardData is missing', () => {
    const event = { clipboardData: null } as unknown as ClipboardEvent

    expect(getImageFileFromClipboard(event)).toBeNull()
  })

  it('ignores non-image file items such as pasted files from Finder', () => {
    const textFile = makeFile('notes.txt', 'text/plain')
    const event = makeClipboardEvent([{ kind: 'file', type: 'text/plain', file: textFile }])

    expect(getImageFileFromClipboard(event)).toBeNull()
  })
})
