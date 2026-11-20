import { describe, expect, it, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useHtmlImage } from './useHtmlImage'

class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  private _src = ''

  set src(value: string) {
    this._src = value
    if (value === 'data:image/png;base64,bad') {
      queueMicrotask(() => this.onerror?.())
      return
    }
    queueMicrotask(() => this.onload?.())
  }

  get src() {
    return this._src
  }
}

describe('useHtmlImage', () => {
  const originalImage = globalThis.Image

  afterEach(() => {
    globalThis.Image = originalImage
    vi.restoreAllMocks()
  })

  it('returns null when there is no source', () => {
    const { result } = renderHook(() => useHtmlImage(null))

    expect(result.current).toBeNull()
  })

  it('resolves to a loaded HTMLImageElement once the source decodes', async () => {
    // @ts-expect-error -- test double for the DOM Image constructor
    globalThis.Image = FakeImage

    const { result } = renderHook(() => useHtmlImage('data:image/png;base64,abc'))

    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current?.src).toBe('data:image/png;base64,abc')
  })

  it('stays null if the image fails to decode', async () => {
    // @ts-expect-error -- test double for the DOM Image constructor
    globalThis.Image = FakeImage

    const { result } = renderHook(() => useHtmlImage('data:image/png;base64,bad'))

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.current).toBeNull()
  })

  it('swaps to the new image when the source changes', async () => {
    // @ts-expect-error -- test double for the DOM Image constructor
    globalThis.Image = FakeImage

    const { result, rerender } = renderHook(({ src }) => useHtmlImage(src), {
      initialProps: { src: 'data:image/png;base64,one' as string | null },
    })

    await waitFor(() => expect(result.current?.src).toBe('data:image/png;base64,one'))

    rerender({ src: 'data:image/png;base64,two' })

    await waitFor(() => expect(result.current?.src).toBe('data:image/png;base64,two'))
  })
})
