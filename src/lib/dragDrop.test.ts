import { describe, expect, it } from 'vitest'
import { getImageFileFromDataTransfer } from './dragDrop'

function makeFile(name: string, type: string) {
  return new File(['x'], name, { type })
}

function makeDataTransfer(files: File[]) {
  return { files } as unknown as DataTransfer
}

describe('getImageFileFromDataTransfer', () => {
  it('returns the first image file dropped', () => {
    const textFile = makeFile('readme.txt', 'text/plain')
    const imageFile = makeFile('shot.png', 'image/png')

    expect(getImageFileFromDataTransfer(makeDataTransfer([textFile, imageFile]))).toBe(imageFile)
  })

  it('returns null when no files are images', () => {
    const textFile = makeFile('readme.txt', 'text/plain')

    expect(getImageFileFromDataTransfer(makeDataTransfer([textFile]))).toBeNull()
  })

  it('returns null when dataTransfer is null', () => {
    expect(getImageFileFromDataTransfer(null)).toBeNull()
  })
})
