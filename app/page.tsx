"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { 
  Upload, Download, Monitor, Camera, Move,
  FileImage, Palette, Moon, Sun,
  Eye, Sparkles
} from "lucide-react"

// Componentes extraídos
import CropOverlay from "@/components/optimizer/CropOverlay"
import DownloadModal from "@/components/optimizer/modals/DownloadModal"
import { 
  LoadImagePopover, 
  WatermarkPopover, 
  FormatQualityPopover,
  PositionPopover,
  AdjustmentsPopover,
  ResponsivePopover,
  SocialTemplatesPopover
} from "@/components/optimizer/popovers"
import useWatermark from "@/components/optimizer/hooks/useWatermark"

// Tipos
type ImagePosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
type ObjectFitMode = "cover" | "contain" | "fill"

interface SocialTemplate {
  id: string
  name: string
  platform: string
  width: number
  height: number
  icon: React.ReactNode
  description: string
  category: 'post' | 'story' | 'cover' | 'ad' | 'thumbnail'
  color: string
}



export default function ImageOptimizerPro() {
  // Estados principales
  const [darkMode, setDarkMode] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [optimizedUrl, setOptimizedUrl] = useState<string>("")
  const [customWidth, setCustomWidth] = useState<number>(800)
  const [customHeight, setCustomHeight] = useState<number>(600)
  const [isDragging, setIsDragging] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp" | "avif">("jpeg")
  const [imagePosition, setImagePosition] = useState<ImagePosition>("center")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string>("")
  
  // Estados de UI
  const [fileName, setFileName] = useState<string>("")
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [objectFit, setObjectFit] = useState<ObjectFitMode>("cover")
  
  // Estados de ajustes
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  const [rotation, setRotation] = useState<number>(0)
  
  // Estados de crop
  const [cropMode, setCropMode] = useState<boolean>(false)
  const [cropData, setCropData] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  
  // Estados multi-imagen
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  
  // Estados para responsive images
  const [generateResponsive, setGenerateResponsive] = useState<boolean>(false)
  const [responsiveSizes] = useState<number[]>([320, 640, 768, 1024, 1280, 1920])
  
  // Estado para plantillas sociales
  const [selectedSocialTemplate, setSelectedSocialTemplate] = useState<SocialTemplate | null>(null)
  
  // Referencias
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [quality] = useState<number>(0.85)

  // Hook de marca de agua
  const watermarkHook = useWatermark()

  // Efectos
  useEffect(() => {
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

  // Funciones de manejo de archivos
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setOptimizedUrl("")
      setUrlError("")
    }
  }, [])

  const loadImageFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) return

    setIsLoadingUrl(true)
    setUrlError("")

    try {
      const urlObj = new URL(url)
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('La URL debe usar HTTP o HTTPS')
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('No se pudo cargar la imagen desde la URL')
      }

      const blob = await response.blob()
      const contentType = blob.type
      
      if (!contentType.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
        throw new Error('La URL no apunta a una imagen válida (JPG, PNG, WebP, AVIF)')
      }

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Función principal de optimización (simplificada)
  const optimizeImage = useCallback(async (width: number, height: number) => {
    if (!selectedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      const imageSource = await createImageBitmap(selectedImage, { imageOrientation: "from-image" })
      
      canvas.width = width
      canvas.height = height

      // Aplicar filtros
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
          
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, width, height)
          
          // Dibujar solo la parte recortada
          ctx.drawImage(
            imageSource,
            cropX, cropY, cropWidth, cropHeight,  // Source rectangle (crop)
            0, 0, width, height                    // Destination rectangle (canvas)
          )
        } else {
          // Fallback: dibujar imagen completa si no se puede calcular el crop
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(imageSource, 0, 0, width, height)
        }
      } else {
        // Sin crop: aplicar lógica normal de object-fit
        const srcW = imageSource.width
        const srcH = imageSource.height
        const imgAspect = srcW / srcH
        const canvasAspect = width / height

        let drawWidth: number, drawHeight: number, offsetX = 0, offsetY = 0

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
        ctx.drawImage(imageSource, offsetX, offsetY, drawWidth, drawHeight)
      }
      
      if (rotation !== 0) {
        ctx.restore()
      }
      
      ctx.filter = "none"

      // Generar imagen base
      const baseDataUrl = canvas.toDataURL(`image/${outputFormat}`, quality)
      
      // Aplicar marca de agua si está habilitada
      let finalDataUrl = baseDataUrl
      if (watermarkHook.applyWatermark) {
        finalDataUrl = await watermarkHook.addWatermarkOnly(baseDataUrl, width, height, canvasRef, outputFormat, quality)
      }

      setOptimizedUrl(finalDataUrl)
    } catch (error) {
      console.error('Error optimizing image:', error)
    }
  }, [selectedImage, brightness, contrast, saturation, rotation, objectFit, outputFormat, quality, watermarkHook, imagePosition, cropData, cropMode])

  useEffect(() => {
    if (!selectedImage) return
    const width = selectedSocialTemplate ? selectedSocialTemplate.width : customWidth
    const height = selectedSocialTemplate ? selectedSocialTemplate.height : customHeight
    optimizeImage(width, height)
  }, [selectedImage, selectedSocialTemplate, customWidth, customHeight, optimizeImage])

  // Función para manejar plantillas sociales
  const handleSocialTemplateSelect = (template: SocialTemplate) => {
    setSelectedSocialTemplate(template)
    setCustomWidth(template.width)
    setCustomHeight(template.height)
  }

  // Funciones de descarga
  const openDownloadModal = () => {
    const defaultName = selectedSocialTemplate?.name.toLowerCase().replace(/\s+/g, "-") || 
                       "imagen-optimizada"
    setFileName(defaultName)
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
          <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Upload className="w-4 h-4" />
                  Cargar
                </Button>
              </PopoverTrigger>
              <LoadImagePopover
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                loadImageFromUrl={loadImageFromUrl}
                isLoadingUrl={isLoadingUrl}
                urlError={urlError}
                isDragging={isDragging}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                handleFileSelect={handleFileSelect}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Sun className="w-4 h-4" />
                  Ajustes
                </Button>
              </PopoverTrigger>
              <AdjustmentsPopover
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                saturation={saturation}
                setSaturation={setSaturation}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Move className="w-4 h-4" />
                  Posición
                </Button>
              </PopoverTrigger>
              <PositionPopover
                imagePosition={imagePosition}
                setImagePosition={setImagePosition}
                objectFit={objectFit}
                setObjectFit={setObjectFit}
                rotation={rotation}
                setRotation={setRotation}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Sparkles className="w-4 h-4" />
                  Plantillas
                </Button>
              </PopoverTrigger>
              <SocialTemplatesPopover
                onTemplateSelect={handleSocialTemplateSelect}
                selectedTemplate={selectedSocialTemplate}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <FileImage className="w-4 h-4" />
                  Marca de Agua
                </Button>
              </PopoverTrigger>
              <WatermarkPopover
                applyWatermark={watermarkHook.applyWatermark}
                setApplyWatermark={watermarkHook.setApplyWatermark}
                watermarkFileInputRef={watermarkHook.watermarkFileInputRef as React.RefObject<HTMLInputElement>}
                handleWatermarkFileSelect={watermarkHook.handleWatermarkFileSelect}
                watermarkFile={watermarkHook.watermarkFile}
                setWatermarkFile={watermarkHook.setWatermarkFile}
                setWatermarkPreviewUrl={watermarkHook.setWatermarkPreviewUrl}
                watermarkPreviewUrl={watermarkHook.watermarkPreviewUrl}
                watermarkPosition={watermarkHook.watermarkPosition}
                setWatermarkPosition={watermarkHook.setWatermarkPosition}
                watermarkOpacity={watermarkHook.watermarkOpacity}
                setWatermarkOpacity={watermarkHook.setWatermarkOpacity}
                debouncedWatermarkOpacity={watermarkHook.debouncedWatermarkOpacity}
                watermarkSize={watermarkHook.watermarkSize}
                setWatermarkSize={watermarkHook.setWatermarkSize}
                debouncedWatermarkSize={watermarkHook.debouncedWatermarkSize}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Palette className="w-4 h-4" />
                  Formato
                </Button>
              </PopoverTrigger>
              <FormatQualityPopover
                outputFormat={outputFormat}
                setOutputFormat={setOutputFormat}
              />
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <Monitor className="w-4 h-4" />
                  Responsive
                </Button>
              </PopoverTrigger>
              <ResponsivePopover
                generateResponsive={generateResponsive}
                setGenerateResponsive={setGenerateResponsive}
                downloadResponsiveImages={downloadResponsiveImages}
                optimizedUrl={optimizedUrl}
                responsiveSizes={responsiveSizes}
              />
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

        {/* Vista previa central */}
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
                      <Camera className="w-24 h-24 mx-auto opacity-30 animate-float" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">¡Bienvenido a ImageOptimizer Pro!</h3>
                    <p className="text-base mb-1">Haz clic en &quot;Cargar&quot; para comenzar</p>
                    <p className="text-sm opacity-70">Arrastra archivos, pega URLs o selecciona desde tu dispositivo</p>
                  </div>
                )}

                {previewUrl && (
                  <div className="space-y-6 animate-fadeIn">
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
                                  const width = selectedSocialTemplate ? selectedSocialTemplate.width : customWidth
                                  const height = selectedSocialTemplate ? selectedSocialTemplate.height : customHeight
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
                              {selectedSocialTemplate ? selectedSocialTemplate.width : customWidth} × {selectedSocialTemplate ? selectedSocialTemplate.height : customHeight}px
                            </Badge>
                          </div>
                          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-700/80 dark:to-blue-600/80 p-4 border-2 border-blue-200 dark:border-blue-400 relative">
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

        {/* Canvas oculto para procesamiento */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Modal de descarga */}
      <DownloadModal
        showDownloadModal={showDownloadModal}
        setShowDownloadModal={setShowDownloadModal}
        fileName={fileName}
        setFileName={setFileName}
        outputFormat={outputFormat}
        handleDownloadWithCustomName={handleDownloadWithCustomName}
      />
    </div>
  )
}
