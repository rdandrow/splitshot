export type NormalizationMode = 'match-height' | 'match-width' | 'fit' | 'stretch'

export interface ImageDimensions {
  width: number
  height: number
}

export interface PlacedImage extends ImageDimensions {
  x: number
  y: number
}

export interface LayoutResult {
  canvas: ImageDimensions
  a: PlacedImage
  b: PlacedImage
}

export interface LayoutOptions {
  /** Horizontal space between the two images, in px. */
  gap?: number
  /** Shared cell size used by 'fit' and 'stretch'. Defaults to the bounding box of both images. */
  fitCanvas?: ImageDimensions
}

const DEFAULT_GAP = 4

interface Cell extends ImageDimensions {
  /** The image's own drawn rect within the cell (letterboxed for 'fit', equal to the cell otherwise). */
  draw: { x: number; y: number; width: number; height: number }
}

function scaleToHeight(image: ImageDimensions, targetHeight: number): ImageDimensions {
  return { width: image.width * (targetHeight / image.height), height: targetHeight }
}

function scaleToWidth(image: ImageDimensions, targetWidth: number): ImageDimensions {
  return { width: targetWidth, height: image.height * (targetWidth / image.width) }
}

function boundingBox(a: ImageDimensions, b: ImageDimensions): ImageDimensions {
  return { width: Math.max(a.width, b.width), height: Math.max(a.height, b.height) }
}

function fitCell(image: ImageDimensions, cell: ImageDimensions): Cell {
  const scale = Math.min(cell.width / image.width, cell.height / image.height)
  const width = image.width * scale
  const height = image.height * scale
  return {
    ...cell,
    draw: { x: (cell.width - width) / 2, y: (cell.height - height) / 2, width, height },
  }
}

function fullCell(size: ImageDimensions): Cell {
  return { ...size, draw: { x: 0, y: 0, width: size.width, height: size.height } }
}

function cellsForMode(
  a: ImageDimensions,
  b: ImageDimensions,
  mode: NormalizationMode,
  options: LayoutOptions,
): { a: Cell; b: Cell } {
  switch (mode) {
    case 'match-height': {
      const targetHeight = Math.min(a.height, b.height)
      return { a: fullCell(scaleToHeight(a, targetHeight)), b: fullCell(scaleToHeight(b, targetHeight)) }
    }
    case 'match-width': {
      const targetWidth = Math.min(a.width, b.width)
      return { a: fullCell(scaleToWidth(a, targetWidth)), b: fullCell(scaleToWidth(b, targetWidth)) }
    }
    case 'fit': {
      const cellSize = options.fitCanvas ?? boundingBox(a, b)
      return { a: fitCell(a, cellSize), b: fitCell(b, cellSize) }
    }
    case 'stretch': {
      const cellSize = options.fitCanvas ?? boundingBox(a, b)
      return { a: fullCell(cellSize), b: fullCell(cellSize) }
    }
  }
}

export function computeLayout(
  a: ImageDimensions,
  b: ImageDimensions,
  mode: NormalizationMode,
  options: LayoutOptions = {},
): LayoutResult {
  const gap = options.gap ?? DEFAULT_GAP
  const cells = cellsForMode(a, b, mode, options)
  const canvasHeight = Math.max(cells.a.height, cells.b.height)

  const aOriginY = (canvasHeight - cells.a.height) / 2
  const bOriginX = cells.a.width + gap
  const bOriginY = (canvasHeight - cells.b.height) / 2

  return {
    canvas: { width: cells.a.width + gap + cells.b.width, height: canvasHeight },
    a: {
      x: cells.a.draw.x,
      y: aOriginY + cells.a.draw.y,
      width: cells.a.draw.width,
      height: cells.a.draw.height,
    },
    b: {
      x: bOriginX + cells.b.draw.x,
      y: bOriginY + cells.b.draw.y,
      width: cells.b.draw.width,
      height: cells.b.draw.height,
    },
  }
}
