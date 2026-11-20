import { describe, expect, it } from 'vitest'
import { computeLayout } from './layout'

describe('computeLayout', () => {
  describe('match-height', () => {
    it('scales both images to the shorter height, preserving aspect ratio', () => {
      const result = computeLayout({ width: 400, height: 300 }, { width: 800, height: 600 }, 'match-height')

      expect(result.a).toEqual({ x: 0, y: 0, width: 400, height: 300 })
      expect(result.b).toEqual({ x: 404, y: 0, width: 400, height: 300 })
      expect(result.canvas).toEqual({ width: 804, height: 300 })
    })

    it('does not upscale: the shorter image sets the target height', () => {
      const result = computeLayout({ width: 1000, height: 500 }, { width: 200, height: 100 }, 'match-height')

      expect(result.a.height).toBe(100)
      expect(result.a.width).toBe(200)
      expect(result.b.height).toBe(100)
      expect(result.b.width).toBe(200)
    })

    it('centers the shorter cell vertically when aspect ratios differ', () => {
      // a: 4:3 -> at target height 300, width 400. b: 1:1 -> at target height 300, width 300.
      const result = computeLayout({ width: 400, height: 300 }, { width: 300, height: 300 }, 'match-height', {
        gap: 0,
      })

      expect(result.canvas).toEqual({ width: 700, height: 300 })
      expect(result.a).toEqual({ x: 0, y: 0, width: 400, height: 300 })
      expect(result.b).toEqual({ x: 400, y: 0, width: 300, height: 300 })
    })
  })

  describe('match-width', () => {
    it('scales both images to the narrower width, preserving aspect ratio', () => {
      const result = computeLayout({ width: 400, height: 300 }, { width: 800, height: 400 }, 'match-width', {
        gap: 0,
      })

      // b scaled to width 400 -> height 200
      expect(result.a).toEqual({ x: 0, y: 0, width: 400, height: 300 })
      expect(result.b).toEqual({ x: 400, y: 50, width: 400, height: 200 })
      expect(result.canvas).toEqual({ width: 800, height: 300 })
    })
  })

  describe('fit', () => {
    it('letterboxes each image, centered, within a shared fixed canvas size', () => {
      // portrait 300x600 vs landscape 800x400, fit into an explicit 400x400 cell each
      const result = computeLayout({ width: 300, height: 600 }, { width: 800, height: 400 }, 'fit', {
        gap: 0,
        fitCanvas: { width: 400, height: 400 },
      })

      // a: contain-scale min(400/300, 400/600) = 0.6667 -> 200x400, centered horizontally in 400-wide cell
      expect(result.a.width).toBeCloseTo(200)
      expect(result.a.height).toBeCloseTo(400)
      expect(result.a.x).toBeCloseTo(100)
      expect(result.a.y).toBeCloseTo(0)

      // b: contain-scale min(400/800, 400/400) = 0.5 -> 400x200, centered vertically in its 400x400 cell
      // b's cell starts at x = 400 (cell width of a) + gap(0)
      expect(result.b.width).toBeCloseTo(400)
      expect(result.b.height).toBeCloseTo(200)
      expect(result.b.x).toBeCloseTo(400)
      expect(result.b.y).toBeCloseTo(100)

      expect(result.canvas).toEqual({ width: 800, height: 400 })
    })

    it('defaults the fit canvas to the bounding box of the two images when not given', () => {
      const result = computeLayout({ width: 100, height: 100 }, { width: 200, height: 50 }, 'fit', { gap: 0 })

      // default fitCanvas = { width: max(100,200)=200, height: max(100,50)=100 }
      expect(result.canvas).toEqual({ width: 400, height: 100 })
    })
  })

  describe('stretch', () => {
    it('stretches both images to fill a shared fixed canvas size, ignoring aspect ratio', () => {
      const result = computeLayout({ width: 300, height: 600 }, { width: 800, height: 400 }, 'stretch', {
        gap: 0,
        fitCanvas: { width: 400, height: 400 },
      })

      expect(result.a).toEqual({ x: 0, y: 0, width: 400, height: 400 })
      expect(result.b).toEqual({ x: 400, y: 0, width: 400, height: 400 })
      expect(result.canvas).toEqual({ width: 800, height: 400 })
    })
  })

  describe('gap', () => {
    it('defaults to a small gap between the two images', () => {
      const result = computeLayout({ width: 100, height: 100 }, { width: 100, height: 100 }, 'match-height')

      expect(result.b.x).toBeGreaterThan(100)
      expect(result.canvas.width).toBe(100 + (result.b.x - 100) + 100)
    })

    it('honors a custom gap', () => {
      const result = computeLayout({ width: 100, height: 100 }, { width: 100, height: 100 }, 'match-height', {
        gap: 20,
      })

      expect(result.b.x).toBe(120)
      expect(result.canvas.width).toBe(220)
    })
  })
})
