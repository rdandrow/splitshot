import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { loadImageFile } from './image'

class FakeImage {
  width = 0
  height = 0
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  private _src = ''

  set src(value: string) {
    this._src = value
    if (value === 'data:image/png;base64,bad') {
      queueMicrotask(() => this.onerror?.())
      return
    }
    this.width = 400
    this.height = 300
    queueMicrotask(() => this.onload?.())
  }

  get src() {
    return this._src
  }
}

describe('loadImageFile', () => {
  const originalImage = globalThis.Image

  beforeEach(() => {
    // @ts-expect-error -- test double for the DOM Image constructor
    globalThis.Image = FakeImage
  })

  afterEach(() => {
    globalThis.Image = originalImage
  })

  it('resolves with the data URL and pixel dimensions of the file', async () => {
    const file = new File(['fake-bytes'], 'screenshot.png', { type: 'image/png' })

    const result = await loadImageFile(file)

    expect(result.name).toBe('screenshot.png')
    expect(result.width).toBe(400)
    expect(result.height).toBe(300)
    expect(result.dataUrl.startsWith('data:')).toBe(true)
  })

  it('rejects when the file cannot be decoded as an image', async () => {
    const badFile = {
      name: 'broken.png',
      type: 'image/png',
    } as File
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      queueMicrotask(() => {
        Object.defineProperty(this, 'result', { value: 'data:image/png;base64,bad', configurable: true })
        this.onload?.(new Event('load') as ProgressEvent<FileReader>)
      })
    })

    await expect(loadImageFile(badFile)).rejects.toThrow()

    vi.restoreAllMocks()
  })
})
