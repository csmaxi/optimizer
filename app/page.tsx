"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Upload, Download, ImageIcon, Smartphone, Monitor, Camera, Move, 
  Link2, FileImage, Palette, Moon, Sun,
  X, Grid3x3, Eye, RotateCw
} from "lucide-react"

// Función debounce para optimizar las barras de ajuste
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface SocialPreset {
  name: string
  platform: string
  width: number
  height: number
  icon: React.ReactNode
}

const socialPresets: SocialPreset[] = [
  { name: "Instagram Post", platform: "Instagram", width: 1080, height: 1080, icon: <Camera className="w-4 h-4" /> },
  {
    name: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    icon: <Smartphone className="w-4 h-4" />,
  },
  { name: "Facebook Cover", platform: "Facebook", width: 820, height: 312, icon: <Monitor className="w-4 h-4" /> },
  { name: "Facebook Post", platform: "Facebook", width: 1200, height: 630, icon: <ImageIcon className="w-4 h-4" /> },
  { name: "X/Twitter Post", platform: "X/Twitter", width: 1200, height: 675, icon: <ImageIcon className="w-4 h-4" /> },
]

type ImagePosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"

type ObjectFitMode = "cover" | "contain" | "fill"

// Componente CropOverlay para superponer sobre la imagen
const CropOverlay = ({ onCrop, aspectRatio }: { onCrop: (data: {x: number, y: number, width: number, height: number}) => void, aspectRatio: string }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [cropRect, setCropRect] = useState({ x: 100, y: 100, width: 200, height: 200 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string>("")

  // Inicializar crop rect con proporción si no es libre
  useEffect(() => {
    if (aspectRatio !== "free") {
      const [w, h] = aspectRatio.split(":").map(Number)
      const ratio = w / h
      setCropRect(prev => ({
        ...prev,
        height: prev.width / ratio
      }))
    }
  }, [aspectRatio])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Verificar si está en un handle de redimensionamiento
    const handle = getResizeHandle(x, y, cropRect)
    if (handle) {
      setIsResizing(true)
      setResizeHandle(handle)
    } else {
      setIsDragging(true)
      setStartPos({ x, y })
    }
  }

  const getResizeHandle = (x: number, y: number, rect: {x: number, y: number, width: number, height: number}) => {
    const handleSize = 15
    const handles = {
      'nw': { x: rect.x, y: rect.y },
      'ne': { x: rect.x + rect.width, y: rect.y },
      'sw': { x: rect.x, y: rect.y + rect.height },
      'se': { x: rect.x + rect.width, y: rect.y + rect.height }
    }
    
    for (const [handle, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
        return handle
      }
    }
    return null
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    if (isDragging) {
      const deltaX = currentX - startPos.x
      const deltaY = currentY - startPos.y
      
      setCropRect(prev => ({
        x: Math.max(0, Math.min(rect.width - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(rect.height - prev.height, prev.y + deltaY)),
        width: prev.width,
        height: prev.height
      }))
      
      setStartPos({ x: currentX, y: currentY })
    } else if (isResizing) {
      setCropRect(prev => {
        const newRect = { ...prev }
        
        switch (resizeHandle) {
          case 'nw':
            newRect.width = Math.max(50, prev.x + prev.width - currentX)
            newRect.height = Math.max(50, prev.y + prev.height - currentY)
            newRect.x = currentX
            newRect.y = currentY
            break
          case 'ne':
            newRect.width = Math.max(50, currentX - prev.x)
            newRect.height = Math.max(50, prev.y + prev.height - currentY)
            newRect.y = currentY
            break
          case 'sw':
            newRect.width = Math.max(50, prev.x + prev.width - currentX)
            newRect.height = Math.max(50, currentY - prev.y)
            newRect.x = currentX
            break
          case 'se':
            newRect.width = Math.max(50, currentX - prev.x)
            newRect.height = Math.max(50, currentY - prev.y)
            break
        }
        
        // Mantener proporción si está configurada
        if (aspectRatio !== "free") {
          const [w, h] = aspectRatio.split(":").map(Number)
          const ratio = w / h
          
          if (resizeHandle === 'nw' || resizeHandle === 'sw') {
            newRect.height = newRect.width / ratio
          } else {
            newRect.height = newRect.width / ratio
          }
        }
        
        return newRect
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle("")
  }

  // Agregar event listeners globales para evitar que se pierda el crop
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle("")
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        // Continuar el crop incluso si el mouse sale de la imagen
        const rect = document.querySelector('.crop-container')?.getBoundingClientRect()
        if (rect) {
          const currentX = e.clientX - rect.left
          const currentY = e.clientY - rect.top
          
          if (isDragging) {
            const deltaX = currentX - startPos.x
            const deltaY = currentY - startPos.y
            
            setCropRect(prev => ({
              x: Math.max(0, Math.min(rect.width - prev.width, prev.x + deltaX)),
              y: Math.max(0, Math.min(rect.height - prev.height, prev.y + deltaY)),
              width: prev.width,
              height: prev.height
            }))
            
            setStartPos({ x: currentX, y: currentY })
          }
        }
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, isResizing, startPos])

  return (
    <div
      className="absolute inset-0 cursor-crosshair select-none crop-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Área de crop */}
      <div
        className="absolute border-2 border-white shadow-lg bg-transparent"
        style={{
          left: cropRect.x,
          top: cropRect.y,
          width: cropRect.width,
          height: cropRect.height
        }}
      >
        {/* Grid de composición */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-white/50" />
          ))}
        </div>
        
        {/* Controles de redimensionamiento */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full cursor-nw-resize shadow-md" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full cursor-ne-resize shadow-md" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full cursor-sw-resize shadow-md" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full cursor-se-resize shadow-md" />
      </div>
      
      {/* Información del crop */}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm font-mono">
        {Math.round(cropRect.width)} × {Math.round(cropRect.height)}px
      </div>
      
      {/* Botón de aplicar crop */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={() => onCrop(cropRect)}
          size="sm"
          className="bg-white text-black hover:bg-gray-100"
        >
          Aplicar Crop
        </Button>
      </div>
    </div>
  )
}

export default function ImageOptimizerPro() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [optimizedUrl, setOptimizedUrl] = useState<string>("")
  const [customWidth, setCustomWidth] = useState<number>(800)
  const [customHeight, setCustomHeight] = useState<number>(600)
  const [selectedPreset, setSelectedPreset] = useState<SocialPreset | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp" | "avif">("jpeg")
  const [imagePosition, setImagePosition] = useState<ImagePosition>("center")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [quality] = useState<number>(0.85)

  const [objectFit, setObjectFit] = useState<ObjectFitMode>("cover")
  const [fileName, setFileName] = useState<string>("")
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  
  // Estados para ajustes de imagen
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  

  
  // Estados para crop
  const [cropMode, setCropMode] = useState<boolean>(false)
  const [cropData, setCropData] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  
  // Estados para crop avanzado
  
  // Estados para rotación
  const [rotation, setRotation] = useState<number>(0)
  
  // Estados para multi-upload
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  
  // Estados para responsive images
  const [generateResponsive, setGenerateResponsive] = useState<boolean>(false)
  const [responsiveSizes] = useState<number[]>([320, 640, 768, 1024, 1280, 1920])



  useEffect(() => {
    // Detectar preferencia del sistema
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setOptimizedUrl("")
      setSelectedPreset(null)
      setUrlError("")
    }
  }, [])

  const loadImageFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) return

    setIsLoadingUrl(true)
    setUrlError("")

    try {
      // Validar que sea una URL válida
      const urlObj = new URL(url)
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('La URL debe usar HTTP o HTTPS')
      }

      // Crear un objeto File simulado desde la URL
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('No se pudo cargar la imagen desde la URL')
      }

      const blob = await response.blob()
      const contentType = blob.type
      
      if (!contentType.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
        throw new Error('La URL no apunta a una imagen válida (JPG, PNG, WebP, AVIF)')
      }

      // Crear un archivo desde el blob
      const file = new File([blob], 'image-from-url', { type: contentType })
      handleFileSelect(file)
      setImageUrl("")
    } catch (error) {
      console.error('Error loading image from URL:', error)
      setUrlError(error instanceof Error ? error.message : 'Error al cargar la imagen')
    } finally {
      setIsLoadingUrl(false)
    }
  }, [handleFileSelect])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const optimizeImage = useCallback(
    async (width: number, height: number) => {
      if (!selectedImage || !canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let imageSource: ImageBitmap | HTMLImageElement
      try {
        // Respeta orientación EXIF
        imageSource = await createImageBitmap(selectedImage, { imageOrientation: "from-image" })
      } catch {
        // Fallback a HTMLImageElement si falla
        imageSource = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new window.Image()
          i.crossOrigin = "anonymous"
          i.onload = () => resolve(i)
          i.onerror = reject
          i.src = previewUrl
        })
      }

      const srcW = imageSource.width
      const srcH = imageSource.height

      canvas.width = width
      canvas.height = height

      // Aplicar filtros de imagen
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      
      // Aplicar rotación si es necesaria
      if (rotation !== 0) {
        ctx.save()
        ctx.translate(width / 2, height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-width / 2, -height / 2)
      }

      // Si hay crop data, aplicar el crop
      if (cropData && cropMode) {
        // Calcular las coordenadas del crop en relación a la imagen original
        const imgElement = document.querySelector('img[alt="Original"]') as HTMLImageElement
        if (imgElement) {
          const imgRect = imgElement.getBoundingClientRect()
          const imgNaturalWidth = imgElement.naturalWidth
          const imgNaturalHeight = imgElement.naturalHeight
          
          // Calcular la escala entre el tamaño natural y el mostrado
          const scaleX = imgNaturalWidth / imgRect.width
          const scaleY = imgNaturalHeight / imgRect.height
          
          // Aplicar el crop
          const cropX = cropData.x * scaleX
          const cropY = cropData.y * scaleY
          const cropWidth = cropData.width * scaleX
          const cropHeight = cropData.height * scaleY
          
          // Dibujar solo la parte recortada
          ctx.drawImage(
            imageSource,
            cropX, cropY, cropWidth, cropHeight,  // Source rectangle (crop)
            0, 0, width, height                    // Destination rectangle (canvas)
          )
        } else {
          // Fallback: dibujar imagen completa si no se puede calcular el crop
          ctx.drawImage(imageSource, 0, 0, width, height)
        }
      } else {
        // Sin crop: aplicar lógica normal de object-fit
        const imgAspect = srcW / srcH
        const canvasAspect = width / height

        let drawWidth: number
        let drawHeight: number
        let offsetX = 0
        let offsetY = 0

        if (objectFit === "cover") {
          if (imgAspect > canvasAspect) {
            drawHeight = height
            drawWidth = height * imgAspect
            switch (imagePosition) {
              case "top-left":
              case "center-left":
              case "bottom-left":
                offsetX = 0
                break
              case "top-center":
              case "center":
              case "bottom-center":
                offsetX = (width - drawWidth) / 2
                break
              case "top-right":
              case "center-right":
              case "bottom-right":
                offsetX = width - drawWidth
                break
            }
          } else {
            drawWidth = width
            drawHeight = width / imgAspect
            switch (imagePosition) {
              case "top-left":
              case "top-center":
              case "top-right":
                offsetY = 0
                break
              case "center-left":
              case "center":
              case "center-right":
                offsetY = (height - drawHeight) / 2
                break
              case "bottom-left":
              case "bottom-center":
              case "bottom-right":
                offsetY = height - drawHeight
                break
            }
          }
        } else if (objectFit === "contain") {
          if (imgAspect > canvasAspect) {
            drawWidth = width
            drawHeight = width / imgAspect
            switch (imagePosition) {
              case "top-left":
              case "top-center":
              case "top-right":
                offsetY = 0
                break
              case "center-left":
              case "center":
              case "center-right":
                offsetY = (height - drawHeight) / 2
                break
              case "bottom-left":
              case "bottom-center":
              case "bottom-right":
                offsetY = height - drawHeight
                break
            }
          } else {
            drawHeight = height
            drawWidth = height * imgAspect
            switch (imagePosition) {
              case "top-left":
              case "center-left":
              case "bottom-left":
                offsetX = 0
                break
              case "top-center":
              case "center":
              case "bottom-center":
                offsetX = (width - drawWidth) / 2
                break
              case "top-right":
              case "center-right":
              case "bottom-right":
                offsetX = width - drawWidth
                break
            }
          }
        } else {
          drawWidth = width
          drawHeight = height
          offsetX = 0
          offsetY = 0
        }

        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        
        // drawImage acepta ImageBitmap o HTMLImageElement
        ctx.drawImage(imageSource, offsetX, offsetY, drawWidth, drawHeight)
      }
      
      if (rotation !== 0) {
        ctx.restore()
      }
      
      // Reset filter
      ctx.filter = "none"

      const desiredMime = `image/${outputFormat}`
      const tryDataUrl = (mime: string) => canvas.toDataURL(mime, quality)
      let dataUrl = tryDataUrl(desiredMime)
      if (!dataUrl.startsWith(`data:${desiredMime}`)) {
        // fallback a webp, luego jpeg, luego png
        const webp = tryDataUrl("image/webp")
        if (webp.startsWith("data:image/webp")) dataUrl = webp
        else {
          const jpeg = tryDataUrl("image/jpeg")
          if (jpeg.startsWith("data:image/jpeg")) dataUrl = jpeg
          else dataUrl = tryDataUrl("image/png")
        }
      }
      setOptimizedUrl(dataUrl)

      // Guardar imagen procesada si está en modo multi-imagen (comentado)
      if (selectedImages.length > 0) {
        console.log(`Imagen ${currentImageIndex} procesada:`, dataUrl.substring(0, 50) + '...')
      }

      // Calcular bytes aproximados (comentado para eliminar warning)
      try {
        const base64 = dataUrl.split(",")[1] || ""
        const calculatedBytes = typeof atob === "function" ? atob(base64).length : Math.ceil(base64.length * 0.75)
        console.log(`Bytes calculados: ${calculatedBytes}`)
      } catch {
        console.log("Error calculando bytes")
      }
    },
    [selectedImage, previewUrl, outputFormat, imagePosition, objectFit, quality, brightness, contrast, saturation, rotation, cropData, cropMode, currentImageIndex, selectedImages.length],
  )

  useEffect(() => {
    if (!selectedImage) return
    const width = selectedPreset ? selectedPreset.width : customWidth
    const height = selectedPreset ? selectedPreset.height : customHeight
    // Preview size: ${width}x${height}
    optimizeImage(width, height)
  }, [selectedImage, selectedPreset, customWidth, customHeight, optimizeImage])

  const handlePresetClick = (preset: SocialPreset) => {
    setSelectedPreset(preset)
    setCustomWidth(preset.width)
    setCustomHeight(preset.height)
    optimizeImage(preset.width, preset.height)
  }







const openDownloadModal = () => {
  const defaultName = selectedPreset?.name.toLowerCase().replace(/\s+/g, "-") || "imagen-optimizada"
  setFileName(defaultName) // Sin extensión, se agrega automáticamente
  setShowDownloadModal(true)
}

const handleDownloadWithCustomName = () => {
  if (!optimizedUrl || !fileName.trim()) return

  const link = document.createElement("a")
  const cleanFileName = fileName.trim()
  const extension = `.${outputFormat}`
  const finalFileName = cleanFileName.endsWith(extension) ? cleanFileName : cleanFileName + extension
  
  link.download = finalFileName
  link.href = optimizedUrl
  link.click()
  setShowDownloadModal(false)
}





// Función para descargar pack responsive
const downloadResponsiveImages = async () => {
  if (!selectedImage || !optimizedUrl) return

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const img = new window.Image()
  img.onload = async () => {
    const baseName = selectedImage.name.split('.')[0]
    
    for (const size of responsiveSizes) {
      // Calcular dimensiones manteniendo aspect ratio
      const aspectRatio = img.width / img.height
      let newWidth = size
      let newHeight = size / aspectRatio

      if (newHeight > size) {
        newHeight = size
        newWidth = size * aspectRatio
      }

      canvas.width = newWidth
      canvas.height = newHeight
      
      // Aplicar filtros
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Descargar
      const dataUrl = canvas.toDataURL(`image/${outputFormat}`, quality)
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${baseName}-${size}w.${outputFormat}`
      a.click()
      
      // Esperar entre descargas
      await new Promise(resolve => setTimeout(resolve, 400))
    }
  }
  img.src = optimizedUrl
}

// Componente Popover para Cargar Imagen
const LoadImagePopover = () => (
  <PopoverContent className="w-96 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="w-4 h-4" />
          Cargar Imagen
                  </CardTitle>
                </CardHeader>
      <CardContent className="space-y-4">
                  {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="w-3 h-3" />
                      Desde URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadImageFromUrl(imageUrl)}
                        disabled={isLoadingUrl}
              className="text-sm"
                        size={1}
                      />
                      <Button 
                        onClick={() => loadImageFromUrl(imageUrl)}
                        disabled={!imageUrl.trim() || isLoadingUrl}
              className="px-3"
                        size="sm"
                      >
                        {isLoadingUrl ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Cargar"}
                      </Button>
                    </div>
                    {urlError && (
            <p className="text-xs text-destructive animate-fadeIn">{urlError}</p>
                    )}
                  </div>

                    <Separator />

                  {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Desde Archivo</Label>
                    <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                        isDragging 
                ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 hover:bg-secondary/20"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">
                        {isDragging ? "Suelta aquí" : "Arrastra y suelta"}
                      </p>
            <p className="text-xs text-muted-foreground mb-2">o haz clic para seleccionar</p>
                      <div className="flex justify-center gap-1">
              <Badge variant="secondary" className="text-xs">JPG</Badge>
              <Badge variant="secondary" className="text-xs">PNG</Badge>
              <Badge variant="secondary" className="text-xs">WebP</Badge>
              <Badge variant="secondary" className="text-xs">AVIF</Badge>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Lote de Imágenes */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">📁 Lote de Imágenes</Label>
                      <p className="text-xs text-muted-foreground">
                        Sube varias imágenes y navega entre ellas para optimizar una por una
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          setSelectedImages(files)
                          // Reset processed images (comentado)
                          if (files.length > 0) {
                            handleFileSelect(files[0])
                            setCurrentImageIndex(0)
                          }
                        }
                        input.click()
                      }}
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Seleccionar Múltiples Imágenes
                    </Button>
                    
                    {selectedImages.length > 0 && (
                      <div className="text-xs space-y-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="font-medium text-foreground">
                          📁 {selectedImages.length} imagen{selectedImages.length > 1 ? 'es' : ''} cargada{selectedImages.length > 1 ? 's' : ''}
                        </div>
                        
                        {selectedImages.length > 1 && (
                          <>
                            <div className="text-muted-foreground">
                              🔍 Imagen actual: {currentImageIndex + 1} de {selectedImages.length}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => {
                                  const newIndex = Math.max(0, currentImageIndex - 1)
                                  setCurrentImageIndex(newIndex)
                                  handleFileSelect(selectedImages[newIndex])
                                }}
                                disabled={currentImageIndex === 0}
                                variant="outline"
                                size="sm"
                                className="text-xs px-3 flex-1"
                              >
                                ← Anterior
                              </Button>
                              <Button
                                onClick={() => {
                                  const newIndex = Math.min(selectedImages.length - 1, currentImageIndex + 1)
                                  setCurrentImageIndex(newIndex)
                                  handleFileSelect(selectedImages[newIndex])
                                }}
                                disabled={currentImageIndex === selectedImages.length - 1}
                                variant="outline"
                                size="sm"
                                className="text-xs px-3 flex-1"
                              >
                                Siguiente →
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
  </PopoverContent>
)

// Componente Popover para Presets Sociales y Tamaño
const PresetsPopover = () => (
  <PopoverContent className="w-80 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3x3 className="w-4 h-4" />
          Presets Sociales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets Sociales */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">📱 Presets Sociales</Label>
          <div className="grid grid-cols-1 gap-2">
            {socialPresets.map((preset) => (
              <Button
                key={preset.name}
                variant={selectedPreset?.name === preset.name ? "default" : "outline"}
                onClick={() => handlePresetClick(preset)}
                className="justify-start h-auto p-3 text-left"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    {preset.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.width} × {preset.height}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </PopoverContent>
)

// Componente Popover para Formato
const FormatQualityPopover = () => (
  <PopoverContent className="w-64 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Formato de Salida
                  </CardTitle>
                </CardHeader>
      <CardContent>
                  <div className="grid grid-cols-2 gap-2">
          {(["jpeg", "png", "webp", "avif"] as const).map((format) => (
                    <Button
              key={format}
              variant={outputFormat === format ? "default" : "outline"}
              onClick={() => setOutputFormat(format)}
              className="text-xs"
              size="sm"
            >
              {format.toUpperCase()}
                    </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </PopoverContent>
)

// Componente Popover para Ajustes de Imagen
const AdjustmentsPopover = () => {
  // Estados locales para preview en tiempo real
  const [previewBrightness, setPreviewBrightness] = useState(brightness)
  const [previewContrast, setPreviewContrast] = useState(contrast)
  const [previewSaturation, setPreviewSaturation] = useState(saturation)

  // Función para aplicar ajustes con debounce
  const applyAdjustments = useMemo(
    () => debounce((...args: unknown[]) => {
      const [newBrightness, newContrast, newSaturation] = args as number[]
      setBrightness(newBrightness)
      setContrast(newContrast)
      setSaturation(newSaturation)
    }, 300),
    []
  )

  // Función para manejar cambios en tiempo real
  const handleBrightnessChange = (value: number) => {
    setPreviewBrightness(value)
    applyAdjustments(value, previewContrast, previewSaturation)
  }

  const handleContrastChange = (value: number) => {
    setPreviewContrast(value)
    applyAdjustments(previewBrightness, value, previewSaturation)
  }

  const handleSaturationChange = (value: number) => {
    setPreviewSaturation(value)
    applyAdjustments(previewBrightness, previewContrast, value)
  }

  return (
    <PopoverContent className="w-80 p-0" align="start">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="w-4 h-4" />
            Ajustes de Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Brillo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Brillo</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {previewBrightness}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={previewBrightness}
                onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contraste */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Contraste</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {previewContrast}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={previewContrast}
                onChange={(e) => handleContrastChange(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Saturación */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Saturación</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {previewSaturation}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={previewSaturation}
                onChange={(e) => handleSaturationChange(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botón Reset */}
          <Button
            onClick={() => {
              setPreviewBrightness(100)
              setPreviewContrast(100)
              setPreviewSaturation(100)
              setBrightness(100)
              setContrast(100)
              setSaturation(100)
            }}
            variant="outline"
            className="w-full text-sm"
            size="sm"
          >
            <RotateCw className="w-3 h-3 mr-2" />
            Resetear Ajustes
          </Button>
        </CardContent>
      </Card>
    </PopoverContent>
  )
}

// Componente Popover para Pack Responsive
const ResponsivePopover = () => (
  <PopoverContent className="w-80 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Monitor className="w-4 h-4" />
          Pack Responsive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Genera automáticamente múltiples tamaños para sitios web responsive
          </p>
        </div>
        
        <div className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generateResponsive}
              onChange={(e) => setGenerateResponsive(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Activar pack responsive</span>
          </div>
        </div>
        
        {generateResponsive && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-foreground">
              📱 Se generarán 6 tamaños:
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">320px</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">640px</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">768px</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">1024px</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">1280px</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">1920px</div>
            </div>
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              💡 <strong>Para qué sirve:</strong> Los sitios web usan diferentes tamaños según el dispositivo (móvil, tablet, desktop) para cargar más rápido.
            </div>
            <Button
              onClick={downloadResponsiveImages}
              disabled={!optimizedUrl}
              variant="default"
              size="sm"
              className="w-full text-xs"
            >
              🌐 Descargar Pack Responsive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </PopoverContent>
)




// Componente Popover para Posición
const PositionPopover = () => (
  <PopoverContent className="w-72 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Move className="w-4 h-4" />
          Posición y Ajuste
                </CardTitle>
              </CardHeader>
      <CardContent className="space-y-4">
        {/* Ajuste de Imagen */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ajuste</Label>
          <div className="grid grid-cols-3 gap-1">
                    <Button
              variant={objectFit === "cover" ? "default" : "outline"}
              onClick={() => setObjectFit("cover")}
              className="text-xs"
                      size="sm"
            >
              Cubrir
            </Button>
            <Button
              variant={objectFit === "contain" ? "default" : "outline"}
              onClick={() => setObjectFit("contain")}
              className="text-xs"
              size="sm"
            >
              Contener
            </Button>
            <Button
              variant={objectFit === "fill" ? "default" : "outline"}
              onClick={() => setObjectFit("fill")}
              className="text-xs"
              size="sm"
            >
              Llenar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Posicionamiento */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Posición</Label>
          <div className="grid grid-cols-3 gap-1">
            {(["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"] as const).map((position) => (
              <Button
                key={position}
                variant={imagePosition === position ? "default" : "outline"}
                onClick={() => setImagePosition(position)}
                className="text-xs h-8"
                size="sm"
              >
                {position === "top-left" ? "↖" : 
                 position === "top-center" ? "↑" :
                 position === "top-right" ? "↗" :
                 position === "center-left" ? "←" :
                 position === "center" ? "●" :
                 position === "center-right" ? "→" :
                 position === "bottom-left" ? "↙" :
                 position === "bottom-center" ? "↓" :
                 "↘"}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rotación */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rotación</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              variant="outline"
              className="text-xs h-8"
              size="sm"
            >
              ↻ 90°
            </Button>
            <Button
              onClick={() => setRotation((prev) => (prev + 180) % 360)}
              variant="outline"
              className="text-xs h-8"
              size="sm"
            >
              ↻ 180°
            </Button>
            <Button
              onClick={() => setRotation((prev) => (prev + 270) % 360)}
              variant="outline"
              className="text-xs h-8"
              size="sm"
            >
              ↻ 270°
            </Button>
          </div>
          {rotation !== 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Rotación: {rotation}°
            </p>
          )}
        </div>
              </CardContent>
            </Card>
  </PopoverContent>
)

const DownloadModal = () => {
  if (!showDownloadModal) return null
  
  // Calcular la vista previa del nombre del archivo
  const trimmed = fileName.trim()
  const previewFileName = !trimmed ? `imagen.${outputFormat}` : 
    trimmed.endsWith(`.${outputFormat}`) ? trimmed : `${trimmed}.${outputFormat}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md bg-background border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Configurar Descarga</CardTitle>
                    <Button
            variant="ghost"
                      size="sm"
            onClick={() => setShowDownloadModal(false)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
                    </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nombre del archivo</Label>
            <Input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={`imagen.${outputFormat}`}
              className="w-full"
              autoFocus
              autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">
              La extensión .{outputFormat} se agregará automáticamente si no la incluyes
            </p>
                </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-mono break-all">
                {previewFileName}
              </span>
                  </div>
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-200 dark:border-blue-800">
              💡 <strong>Tip:</strong> Crea una carpeta &quot;Optimizer&quot; en Descargas y mueve los archivos allí después de descargarlos
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
                    <Button
              variant="outline"
              onClick={() => setShowDownloadModal(false)}
              className="flex-1"
              type="button"
            >
              Cancelar
                    </Button>
            <Button
              onClick={handleDownloadWithCustomName}
              disabled={!fileName.trim()}
              className="flex-1"
              type="button"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
                </div>
              </CardContent>
            </Card>
          </div>
  )
}

return (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Fondo con gradiente mesh */}
    <div className="absolute inset-0 gradient-mesh opacity-30 dark:opacity-20" />
    <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-5" />
    
    <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
      {/* Botón de modo claro/oscuro flotante */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-3 rounded-full bg-card/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Cambiar tema"
      >
        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
      </button>

      {/* Header con barra de herramientas */}
      <header className="mb-8 animate-fadeIn">
        {/* Barra de herramientas con Popovers */}
        <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Upload className="w-4 h-4" />
                Cargar
              </Button>
            </PopoverTrigger>
            <LoadImagePopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Grid3x3 className="w-4 h-4" />
                Presets
              </Button>
            </PopoverTrigger>
            <PresetsPopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Palette className="w-4 h-4" />
                Formato
              </Button>
            </PopoverTrigger>
            <FormatQualityPopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Move className="w-4 h-4" />
                Posición
              </Button>
            </PopoverTrigger>
            <PositionPopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Sun className="w-4 h-4" />
                Ajustes
              </Button>
            </PopoverTrigger>
            <AdjustmentsPopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Monitor className="w-4 h-4" />
                Responsive
              </Button>
            </PopoverTrigger>
            <ResponsivePopover />
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex-1" />

          {optimizedUrl && (
            <Button
              onClick={openDownloadModal}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <Download className="w-3 h-3 mr-1" />
              Descargar
            </Button>
          )}
                  </div>
      </header>

      {/* Vista previa central optimizada */}
      <div className="max-w-none mx-auto animate-fadeIn">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Eye className="w-5 h-5" />
              Vista Previa
              {selectedImage && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {selectedImage.name}
                </Badge>
              )}
                </CardTitle>
              </CardHeader>
          <CardContent>
            <div className="min-h-[600px] flex flex-col justify-center">
              {!previewUrl && (
                <div className="text-center py-16 text-muted-foreground animate-fadeIn">
                  <div className="relative inline-block mb-6">
                    <ImageIcon className="w-24 h-24 mx-auto opacity-30 animate-float" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">¡Bienvenido a ImageOptimizer Pro!</h3>
                  <p className="text-base mb-1">Haz clic en &quot;Cargar&quot; para comenzar</p>
                  <p className="text-sm opacity-70">Arrastra archivos, pega URLs o selecciona desde tu dispositivo</p>
                </div>
              )}

                  {previewUrl && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Layout horizontal para Original y Resultado */}
                  <div className={`grid gap-6 ${optimizedUrl ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Imagen Original */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-sm">
                          Original
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {selectedImage?.name.split('.').pop()?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 border dark:border-slate-500 relative">
                        {/* Patrón de fondo sutil */}
                        <div className="absolute inset-0 opacity-20 dark:opacity-50">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(71,85,105,0.3)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(203,213,225,0.6)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                        </div>
                        {/* Imagen principal */}
                        <div className="relative z-10">
                          <Image
                            src={previewUrl}
                            alt="Original"
                            width={800}
                            height={400}
                            className="w-full max-h-80 object-contain rounded-lg shadow-lg"
                            unoptimized
                          />
                          {cropMode && (
                            <CropOverlay
                              onCrop={(data) => {
                                setCropData(data)
                                setCropMode(false)
                                // Aplicar el crop real llamando a optimizeImage
                                const width = selectedPreset ? selectedPreset.width : customWidth
                                const height = selectedPreset ? selectedPreset.height : customHeight
                                optimizeImage(width, height)
                              }}
                              aspectRatio="free"
                            />
                          )}
                        </div>
                    </div>
                    </div>

                    {/* Imagen Optimizada */}
                  {optimizedUrl && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-sm">
                            Resultado
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {customWidth} × {customHeight}px
                          </Badge>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-700/80 dark:to-blue-600/80 p-4 border-2 border-blue-200 dark:border-blue-400 relative">
                          {/* Patrón de fondo sutil con color azul */}
                          <div className="absolute inset-0 opacity-25 dark:opacity-60">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.4)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(147,197,253,0.8)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                          </div>
                          {/* Imagen principal */}
                          <div className="relative z-10">
                          <Image
                              src={optimizedUrl}
                            alt="Optimizada"
                              width={800}
                              height={400}
                              className="w-full max-h-80 object-contain rounded-lg shadow-lg"
                            unoptimized
                          />
                        </div>
                          </div>
                        </div>
                        )}
                      </div>

                  
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

    {/* Modal de descarga */}
    <DownloadModal />
    </div>
  )
}