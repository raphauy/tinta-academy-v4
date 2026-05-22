'use client'

import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadDiplomaBaseImageAction } from '@/app/educator/courses/[id]/diploma/actions'

export type DiplomaBaseImage = {
  url: string
  width: number
  height: number
}

type Props = {
  courseId: string
  value: DiplomaBaseImage | null
  onChange: (next: DiplomaBaseImage) => void
  disabled?: boolean
}

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/png,image/jpeg'

export function ImageBaseUpload({
  courseId,
  value,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const triggerSelect = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error('La imagen debe ser PNG o JPEG')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('La imagen no debe superar los 5 MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadDiplomaBaseImageAction(courseId, formData)
      if (!result.success || !result.data) {
        toast.error(result.success ? 'Error al subir' : result.error)
        return
      }
      onChange(result.data)
      toast.success('Imagen subida')
    } catch (error) {
      console.error(error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt="Imagen base del diploma"
            className="w-full max-w-xs rounded-md border"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {value.width} × {value.height} px
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={triggerSelect}
              disabled={disabled || uploading}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {uploading ? 'Subiendo…' : 'Cambiar imagen'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled || uploading}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center',
            'hover:bg-muted/50 transition disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {uploading ? 'Subiendo…' : 'Subir imagen base del diploma'}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG o JPEG, hasta 5 MB
          </span>
        </button>
      )}
    </div>
  )
}
