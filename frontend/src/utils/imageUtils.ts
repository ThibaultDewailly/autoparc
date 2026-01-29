import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE } from './constants'

/**
 * Validate if a file is an allowed image type
 */
export function isValidImageType(file: File): boolean {
  return ALLOWED_PHOTO_TYPES.includes(file.type)
}

/**
 * Validate if a file size is within the limit
 */
export function isValidImageSize(file: File): boolean {
  return file.size <= MAX_PHOTO_SIZE
}

/**
 * Validate image file (type and size)
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Types acceptés: ${ALLOWED_PHOTO_TYPES.join(', ')}`
    }
  }
  
  if (!isValidImageSize(file)) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximum: ${MAX_PHOTO_SIZE / (1024 * 1024)}MB`
    }
  }
  
  return { valid: true }
}

/**
 * Resize an image before upload
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la création du blob'))
              return
            }
            
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            
            resolve(resizedFile)
          },
          file.type,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Create a thumbnail for an image
 */
export async function createThumbnail(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL(file.type))
      }
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert blob to data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
