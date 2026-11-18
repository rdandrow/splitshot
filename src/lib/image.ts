export interface LoadedImage {
  name: string
  dataUrl: string
  width: number
  height: number
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.width, height: image.height })
    image.onerror = () => reject(new Error('Failed to decode image'))
    image.src = dataUrl
  })
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const dataUrl = await readFileAsDataUrl(file)
  const { width, height } = await getImageDimensions(dataUrl)
  return { name: file.name, dataUrl, width, height }
}
