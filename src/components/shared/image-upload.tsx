'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ImagePlus, X, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/services/upload-service'

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number
  aspectRatio?: 'square' | 'video' | 'auto'
  className?: string
  disabled?: boolean
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: 'aspect-auto min-h-[150px]',
}

export function ImageUpload({
  value,
  onChange,
  onError,
  accept = 'image/*',
  maxSize = 4 * 1024 * 1024,
  aspectRatio = 'square',
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleError = useCallback(
    (message: string) => {
      onError?.(message)
    },
    [onError]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        handleError('El archivo debe ser una imagen')
        return
      }

      if (file.size > maxSize) {
        handleError(`El archivo no debe superar ${maxSize / 1024 / 1024}MB`)
        return
      }

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadImage(formData)

        if (!result.success) {
          throw new Error(result.error)
        }

        onChange(result.url)
      } catch (error) {
        handleError(
          error instanceof Error ? error.message : 'Error al subir la imagen'
        )
      } finally {
        setIsUploading(false)
      }
    },
    [maxSize, onChange, handleError]
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      event.target.value = ''
    },
    [uploadFile]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)

      if (disabled || isUploading) return

      const file = event.dataTransfer.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    [disabled, isUploading, uploadFile]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemove = useCallback(() => {
    onChange(null)
  }, [onChange])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading])

  // Check if this is a circular upload (for avatars)
  const isCircular = className?.includes('rounded-full')

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div
          className={cn(
            'relative overflow-hidden border',
            isCircular ? 'rounded-full' : 'rounded-lg',
            aspectRatioClasses[aspectRatio]
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded image"
            className="size-full object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className={cn(
                'absolute size-8',
                isCircular ? 'right-0 top-0' : 'right-2 top-2'
              )}
              onClick={handleRemove}
            >
              <X className="size-4" />
              <span className="sr-only">Eliminar imagen</span>
            </Button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick()
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center transition-colors',
            aspectRatioClasses[aspectRatio],
            isCircular
              ? cn(
                  'rounded-full border-dashed-circle gap-1 p-2',
                  isDragging && 'dragging'
                )
              : cn(
                  'rounded-lg border-2 border-dashed gap-2 p-6',
                  isDragging && 'border-primary bg-primary/5'
                ),
            !disabled && !isUploading && 'cursor-pointer hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2
                className={cn(
                  'animate-spin text-muted-foreground',
                  isCircular ? 'size-6' : 'size-10'
                )}
              />
              {!isCircular && (
                <p className="text-sm text-muted-foreground">Subiendo...</p>
              )}
            </>
          ) : (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-full bg-muted',
                  isCircular ? 'size-8' : 'size-12'
                )}
              >
                {isDragging ? (
                  <Upload
                    className={cn(
                      'text-primary',
                      isCircular ? 'size-4' : 'size-6'
                    )}
                  />
                ) : (
                  <ImagePlus
                    className={cn(
                      'text-muted-foreground',
                      isCircular ? 'size-4' : 'size-6'
                    )}
                  />
                )}
              </div>
              {!isCircular && (
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragging ? 'Suelta para subir' : 'Haz clic o arrastra una imagen'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, GIF hasta {maxSize / 1024 / 1024}MB
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
