import { useEffect, useState } from 'react'

interface LoadedImage {
  src: string
  element: HTMLImageElement
}

/** Decodes a data URL (or any image src) into an HTMLImageElement for canvas rendering. */
export function useHtmlImage(src: string | null): HTMLImageElement | null {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null)

  useEffect(() => {
    if (!src) return

    let cancelled = false
    const element = new window.Image()
    element.onload = () => {
      if (!cancelled) setLoaded({ src, element })
    }
    element.onerror = () => {
      if (!cancelled) setLoaded(null)
    }
    element.src = src

    return () => {
      cancelled = true
      element.onload = null
      element.onerror = null
    }
  }, [src])

  return loaded?.src === src ? loaded.element : null
}
