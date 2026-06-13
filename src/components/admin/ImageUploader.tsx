'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, X, Loader2, LinkIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  url: string
  publicId: string
  file?: File
  preview?: string
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  uploading: boolean
  setUploading: (uploading: boolean) => void
  maxImages?: number
}

/**
 * Shared image uploader component with support for:
 * - File drag & drop (from desktop)
 * - URL drag & drop (from browser tabs like Shopee)
 * - File picker (click to browse)
 * - URL input (paste image URLs)
 */
export default function ImageUploader({
  images,
  onImagesChange,
  uploading,
  setUploading,
  maxImages = 10,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploadingUrl, setUploadingUrl] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload a local file to Cloudinary
  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'grosirpj/products')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload gagal')
      const data = await res.json()
      return { url: data.url, publicId: data.publicId }
    } catch {
      toast.error(`Gagal upload gambar: ${file.name}`)
      return null
    }
  }

  // Upload an image from URL to Cloudinary
  const uploadFromUrl = async (url: string): Promise<UploadedImage | null> => {
    try {
      const res = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder: 'grosirpj/products' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload dari URL gagal')
      }
      const data = await res.json()
      return { url: data.url, publicId: data.publicId }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload dari URL')
      return null
    }
  }

  // Handle file uploads
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    )

    if (fileArray.length === 0) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')
      return
    }

    const newImages: UploadedImage[] = fileArray.map((file) => ({
      url: '',
      publicId: '',
      file,
      preview: URL.createObjectURL(file),
    }))

    onImagesChange([...images, ...newImages])

    setUploading(true)
    for (let i = 0; i < fileArray.length; i++) {
      const result = await uploadFile(fileArray[i])
      if (result) {
        onImagesChange(
          images.concat(newImages).map((img, idx) => {
            if (idx === images.length + i) {
              return { ...result, preview: newImages[i].preview }
            }
            return img
          })
        )
      }
    }
    setUploading(false)
  }, [images, onImagesChange, setUploading])

  // Handle URL imports
  const handleUrlImport = useCallback(async () => {
    const url = urlInput.trim()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error('URL tidak valid')
      return
    }

    // Add placeholder
    const placeholder: UploadedImage = {
      url: '',
      publicId: '',
      preview: url,
    }
    onImagesChange([...images, placeholder])
    setUrlInput('')
    setShowUrlInput(false)

    setUploadingUrl(true)
    setUploading(true)
    const result = await uploadFromUrl(url)
    if (result) {
      onImagesChange(
        [...images, { ...result, preview: url }].filter((img, idx) => {
          if (idx === images.length) {
            return result.url // Replace placeholder with actual
          }
          return true
        })
      )
    } else {
      // Remove placeholder on failure
      onImagesChange(images)
    }
    setUploadingUrl(false)
    setUploading(false)
  }, [urlInput, images, onImagesChange, setUploading])

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop - supports both files AND URLs from browser tabs
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    // First try files (drag from desktop)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )
      if (imageFiles.length > 0) {
        handleFiles(e.dataTransfer.files)
        return
      }
    }

    // Then try URLs (drag from browser tabs like Shopee)
    const htmlData = e.dataTransfer.getData('text/html')
    const textData = e.dataTransfer.getData('text/plain')
    const uriData = e.dataTransfer.getData('text/uri-list')

    // Extract URLs from various data formats
    const urls: string[] = []

    // Try URI list first
    if (uriData) {
      urls.push(...uriData.split('\n').map(u => u.trim()).filter(Boolean))
    }

    // Try extracting from HTML (img src)
    if (htmlData && urls.length === 0) {
      const imgSrcMatch = htmlData.match(/<img[^>]+src="([^"]+)"/)
      if (imgSrcMatch) {
        urls.push(imgSrcMatch[1])
      }
    }

    // Try plain text URL
    if (textData && urls.length === 0) {
      try {
        new URL(textData)
        if (textData.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) ||
            textData.includes('img') || textData.includes('image') ||
            textData.includes('cloudinary') || textData.includes('shopee')) {
          urls.push(textData)
        }
      } catch {
        // Not a valid URL, ignore
      }
    }

    if (urls.length > 0) {
      // Upload each URL
      for (const url of urls) {
        const placeholder: UploadedImage = {
          url: '',
          publicId: '',
          preview: url,
        }
        onImagesChange([...images, placeholder])

        setUploading(true)
        const result = await uploadFromUrl(url)
        if (result) {
          onImagesChange((prev: UploadedImage[]) =>
            prev.map((img) =>
              img.preview === url ? { ...result, preview: url } : img
            )
          )
        } else {
          onImagesChange((prev: UploadedImage[]) =>
            prev.filter((img) => img.preview !== url)
          )
        }
        setUploading(false)
      }
      toast.success(`${urls.length} gambar berhasil diimport dari URL`)
    } else {
      toast.error('Tidak ada gambar yang ditemukan. Coba drag file gambar dari komputer Anda.')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(
      images.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          dragActive
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            dragActive ? 'bg-emerald-100' : 'bg-gray-100'
          )}
        >
          <Upload
            className={cn(
              'h-6 w-6',
              dragActive ? 'text-emerald-600' : 'text-gray-400'
            )}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drag & drop gambar di sini
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP, GIF
          </p>
        </div>
        {(uploading || uploadingUrl) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">
                {uploadingUrl ? 'Mengimport dari URL...' : 'Mengupload...'}
              </span>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* URL Import */}
      <div>
        {showUrlInput ? (
          <div className="flex gap-2">
            <Input
              placeholder="Paste URL gambar (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleUrlImport()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleUrlImport}
              disabled={!urlInput.trim() || uploadingUrl}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {uploadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowUrlInput(false); setUrlInput('') }}
            >
              Batal
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Import dari URL</span>
          </button>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${img.preview}-${index}`}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <img
                src={img.preview || img.url}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If preview fails, try using the url directly
                  const target = e.target as HTMLImageElement
                  if (target.src !== img.url && img.url) {
                    target.src = img.url
                  }
                }}
              />
              {!img.url && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              )}
              {index === 0 && img.url && (
                <Badge className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[10px] px-1.5 py-0">
                  Utama
                </Badge>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {/* Add more images button */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <ImageIcon className="h-6 w-6 text-gray-300 mb-1" />
              <span className="text-xs text-gray-400">Tambah</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          Minimal 1 gambar diperlukan
        </p>
      )}
    </div>
  )
}
