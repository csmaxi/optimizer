"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, Download, ImageIcon, Smartphone, Monitor, Camera, Move, 
  Sparkles, Link2, FileImage, Palette, Layers, Moon, Sun, Settings
} from "lucide-react"

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
  const [quality, setQuality] = useState<number>(0.85)
  const [optimizedSize, setOptimizedSize] = useState<number>(0)

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes < 0) return "-"
    const units = ["B", "KB", "MB", "GB"]
    let unitIndex = 0
    let value = bytes
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }
    const decimals = value >= 10 || unitIndex === 0 ? 0 : 1
    return `${value.toFixed(decimals)} ${units[unitIndex]}`
  }

  const calcSavingPercent = (originalBytes: number, optimizedBytes: number): string => {
    if (!originalBytes || !optimizedBytes) return "0%"
    const saving = ((originalBytes - optimizedBytes) / originalBytes) * 100
    const clamped = Math.max(0, Math.min(100, saving))
    return `${clamped.toFixed(0)}%`
  }

  const copyOptimizedToClipboard = async () => {
    if (!optimizedUrl) return
          try {
        const resp = await fetch(optimizedUrl)
        const blob = await resp.blob()
        const item = new ClipboardItem({ [blob.type]: blob })
        await navigator.clipboard.write([item])
      } catch {
      try {
        await navigator.clipboard.writeText(optimizedUrl)
      } catch {
        // ignore
      }
    }
  }

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

      const imgAspect = srcW / srcH
      const canvasAspect = width / height

      let drawWidth: number
      let drawHeight: number
      let offsetX = 0
      let offsetY = 0

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

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      // drawImage acepta ImageBitmap o HTMLImageElement
      ctx.drawImage(imageSource, offsetX, offsetY, drawWidth, drawHeight)

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

      // Calcular bytes aproximados
      try {
        const base64 = dataUrl.split(",")[1] || ""
        const bytes = typeof atob === "function" ? atob(base64).length : Math.ceil(base64.length * 0.75)
        setOptimizedSize(bytes)
      } catch {
        setOptimizedSize(0)
      }
    },
    [selectedImage, previewUrl, outputFormat, imagePosition, quality],
  )

  useEffect(() => {
    if (!selectedImage) return
    const width = selectedPreset ? selectedPreset.width : customWidth
    const height = selectedPreset ? selectedPreset.height : customHeight
    optimizeImage(width, height)
  }, [outputFormat, quality, selectedImage, selectedPreset, customWidth, customHeight, optimizeImage])

  const handlePresetClick = (preset: SocialPreset) => {
    setSelectedPreset(preset)
    setCustomWidth(preset.width)
    setCustomHeight(preset.height)
    optimizeImage(preset.width, preset.height)
  }

  const handleCustomOptimize = () => {
    setSelectedPreset(null)
    optimizeImage(customWidth, customHeight)
  }

  const downloadOptimized = () => {
    if (!optimizedUrl) return

    const link = document.createElement("a")
    link.download = `optimized-${selectedPreset?.name.toLowerCase().replace(/\s+/g, "-") || "custom"}.${outputFormat}`
    link.href = optimizedUrl
    link.click()
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fondo con gradiente mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-5" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header mejorado con animaciones */}
        <header className="mb-12 animate-fadeIn">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl gradient-primary shadow-glow animate-pulse-soft">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black">ImageOptimizer Pro</h1>
                <p className="text-muted-foreground text-lg mt-1">Transforma tus imágenes con un clic</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full glass hover-scale transition-smooth"
              aria-label="Cambiar tema"
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
            </button>
          </div>
          
    
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Panel Izquierdo - Controles de Imagen */}
          <div className="xl:col-span-1 space-y-6 animate-slideInLeft">
            {/* Sección de Carga */}
            <div className="space-y-4">
              <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden group">
                <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-primary">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">Cargar Imagen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  {/* URL Input */}
                  <div className="p-3 rounded-lg bg-secondary/20 backdrop-blur-sm">
                    <Label htmlFor="imageUrl" className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <Link2 className="w-4 h-4" />
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
                        className="glass text-sm"
                        size={1}
                      />
                      <Button 
                        onClick={() => loadImageFromUrl(imageUrl)}
                        disabled={!imageUrl.trim() || isLoadingUrl}
                        className="gradient-primary text-white hover-scale px-3"
                        size="sm"
                      >
                        {isLoadingUrl ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Cargar"}
                      </Button>
                    </div>
                    {urlError && (
                      <p className="text-xs text-destructive mt-2 animate-fadeIn">{urlError}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-xs text-muted-foreground">o</span>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Desde Archivo</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer group ${
                        isDragging 
                          ? "border-primary bg-primary/10 scale-105 shadow-glow" 
                          : "border-border hover:border-primary/50 hover:bg-secondary/20"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 gradient-radial opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors animate-float" />
                      <p className="text-sm font-medium mb-1">
                        {isDragging ? "Suelta aquí" : "Arrastra y suelta"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">o haz clic para seleccionar</p>
                      <div className="flex justify-center gap-1">
                        <Badge variant="secondary" className="glass text-xs">JPG</Badge>
                        <Badge variant="secondary" className="glass text-xs">PNG</Badge>
                        <Badge variant="secondary" className="glass text-xs">WebP</Badge>
                        <Badge variant="secondary" className="glass text-xs">AVIF</Badge>
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
                </CardContent>
              </Card>
            </div>

            {/* Sección de Configuración */}
            <div className="space-y-4">
              {/* Tamaño Personalizado */}
              <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden group">
                <div className="absolute inset-0 gradient-success opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-success">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold">Tamaño</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="width" className="text-sm font-medium">Ancho (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        min="1"
                        max="4000"
                        className="glass mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-sm font-medium">Alto (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        min="1"
                        max="4000"
                        className="glass mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCustomOptimize} 
                    disabled={!selectedImage} 
                    className="w-full gradient-success text-white hover-scale transition-spring text-sm py-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Aplicar Tamaño
                  </Button>
                </CardContent>
              </Card>

              {/* Formato de Salida */}
              <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden group">
                <div className="absolute inset-0 gradient-secondary opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-secondary">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold">Formato</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={outputFormat === "jpeg" ? "default" : "outline"}
                      onClick={() => setOutputFormat("jpeg")}
                      className={`flex-1 transition-all hover-scale text-sm py-2 ${
                        outputFormat === "jpeg" 
                          ? "gradient-secondary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      JPG
                    </Button>
                    <Button
                      variant={outputFormat === "png" ? "default" : "outline"}
                      onClick={() => setOutputFormat("png")}
                      className={`flex-1 transition-all hover-scale text-sm py-2 ${
                        outputFormat === "png" 
                          ? "gradient-secondary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      PNG
                    </Button>
                    <Button
                      variant={outputFormat === "webp" ? "default" : "outline"}
                      onClick={() => setOutputFormat("webp")}
                      className={`flex-1 transition-all hover-scale text-sm py-2 ${
                        outputFormat === "webp" 
                          ? "gradient-secondary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      WebP
                    </Button>
                    <Button
                      variant={outputFormat === "avif" ? "default" : "outline"}
                      onClick={() => setOutputFormat("avif")}
                      className={`flex-1 transition-all hover-scale text-sm py-2 ${
                        outputFormat === "avif" 
                          ? "gradient-secondary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      AVIF
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Calidad: {(quality * 100) | 0}%</Label>
                    <input
                      type="range"
                      min={0.4}
                      max={1}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full mt-2 accent-current"
                    />
                    <p className="text-xs text-muted-foreground mt-1">AVIF/WebP suelen ofrecer mejor compresión con similar calidad.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Panel Central - Presets y Posición */}
          <div className="xl:col-span-1 space-y-6">
            {/* Presets de Redes Sociales */}
            <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden group">
              <div className="absolute inset-0 gradient-secondary opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-secondary">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Presets Sociales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 gap-3">
                  {socialPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant={selectedPreset?.name === preset.name ? "default" : "outline"}
                      className={`justify-start h-auto p-3 transition-all hover-scale ${
                        selectedPreset?.name === preset.name 
                          ? "gradient-primary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                      onClick={() => handlePresetClick(preset)}
                      disabled={!selectedImage}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          selectedPreset?.name === preset.name 
                            ? "bg-white/20" 
                            : "bg-primary/10"
                        }`}>
                          {preset.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-sm">{preset.name}</div>
                          <div className="text-xs opacity-80">
                            {preset.width} × {preset.height}px
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Control de Posición */}
            <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden group">
              <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-primary">
                    <Move className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Posición</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { value: "top-left", label: "↖" },
                    { value: "top-center", label: "↑" },
                    { value: "top-right", label: "↗" },
                    { value: "center-left", label: "←" },
                    { value: "center", label: "⊙" },
                    { value: "center-right", label: "→" },
                    { value: "bottom-left", label: "↙" },
                    { value: "bottom-center", label: "↓" },
                    { value: "bottom-right", label: "↘" },
                  ].map((position) => (
                    <Button
                      key={position.value}
                      variant={imagePosition === position.value ? "default" : "outline"}
                      size="sm"
                      className={`h-10 text-lg font-bold transition-all hover-scale ${
                        imagePosition === position.value 
                          ? "gradient-primary text-white shadow-glow" 
                          : "glass hover:bg-secondary/50"
                      }`}
                      onClick={() => {
                        setImagePosition(position.value as ImagePosition)
                        if (selectedImage) {
                          if (selectedPreset) {
                            optimizeImage(selectedPreset.width, selectedPreset.height)
                          } else {
                            optimizeImage(customWidth, customHeight)
                          }
                        }
                      }}
                      disabled={!selectedImage}
                    >
                      {position.label}
                    </Button>
                  ))}
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="glass px-3 py-1 text-sm">
                    <Move className="w-3 h-3 mr-1" />
                    {imagePosition.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Vista Previa */}
          <div className="xl:col-span-1 space-y-6 animate-slideInRight">
            <Card className="glass border-0 shadow-elegant hover-lift overflow-hidden">
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-primary">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Vista Previa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  {previewUrl && (
                    <div className="animate-fadeIn">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="outline" className="glass text-sm">
                          Original
                        </Badge>
                      </h4>
                      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-muted to-secondary/20 p-2 shadow-elegant">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Original"
                          width={400}
                          height={160}
                          className="w-full h-40 object-contain rounded-md"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  {optimizedUrl && (
                    <>
                      <Separator className="my-4" />
                      <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="glass text-sm">
                            Optimizada
                          </Badge>
                          <Badge className="gradient-primary text-white text-sm">
                            {customWidth} × {customHeight}px
                          </Badge>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-2 shadow-elegant animate-pulse-soft">
                          <Image
                            src={optimizedUrl || "/placeholder.svg"}
                            alt="Optimizada"
                            width={400}
                            height={160}
                            className="w-full h-40 object-contain rounded-md"
                            unoptimized
                          />
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <div className="flex gap-2">
                            {selectedImage && (
                              <Badge variant="secondary" className="glass">
                                Original: {formatBytes(selectedImage.size)}
                              </Badge>
                            )}
                            {optimizedUrl && optimizedSize > 0 && (
                              <Badge variant="secondary" className="glass">
                                Optimizada: {formatBytes(optimizedSize)}
                              </Badge>
                            )}
                          </div>
                          {selectedImage && optimizedSize > 0 && (
                            <Badge className="gradient-success text-white">
                              Ahorro: {calcSavingPercent(selectedImage.size, optimizedSize)}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          onClick={downloadOptimized} 
                          className="w-full mt-4 gradient-primary text-white hover-scale transition-spring shadow-glow" 
                          size="default"
                        >
                          <Download className="w-4 h-4 mr-2 animate-pulse" />
                          Descargar
                        </Button>
                        {optimizedUrl && (
                          <Button 
                            onClick={copyOptimizedToClipboard}
                            className="w-full mt-2 glass hover-scale"
                            size="sm"
                            variant="outline"
                          >
                            Copiar al portapapeles
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  {!previewUrl && (
                    <div className="text-center py-12 text-muted-foreground animate-fadeIn">
                      <div className="relative inline-block">
                        <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-30 animate-float" />
                        <div className="absolute inset-0 gradient-radial" />
                      </div>
                      <p className="font-medium">Sube una imagen para comenzar</p>
                      <p className="text-sm mt-2 opacity-70">Arrastra, pega una URL o selecciona un archivo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}