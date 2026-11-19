export function getImageFileFromDataTransfer(dataTransfer: DataTransfer | null): File | null {
  if (!dataTransfer) return null

  for (const file of dataTransfer.files) {
    if (file.type.startsWith('image/')) {
      return file
    }
  }

  return null
}
