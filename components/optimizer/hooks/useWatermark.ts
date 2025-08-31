"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export const useWatermark = () => {
  // Estados para marca de agua
  const [applyWatermark, setApplyWatermark] = useState<boolean>(false)
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3)
  const [watermarkSize, setWatermarkSize] = useState<number>(0.15) // 15% del tamaño de la imagen
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null)
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState<string>("") // Sin marca de agua predeterminada
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right')
  const watermarkFileInputRef = useRef<HTMLInputElement>(null)

  // Estados con debounce para evitar re-renders constantes
  const [debouncedWatermarkOpacity, setDebouncedWatermarkOpacity] = useState<number>(0.3)
  const [debouncedWatermarkSize, setDebouncedWatermarkSize] = useState<number>(0.15)

  // Cache para la imagen base (sin marca de agua)
  const [cachedBaseImage, setCachedBaseImage] = useState<string>("")
  const [cacheKey, setCacheKey] = useState<string>("")

  // Debounce para watermark opacity
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedWatermarkOpacity(watermarkOpacity)
    }, 300) // 300ms de debounce - más responsivo

    return () => clearTimeout(timeoutId)
  }, [watermarkOpacity])

  // Debounce para watermark size
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedWatermarkSize(watermarkSize)
    }, 300) // 300ms de debounce - más responsivo

    return () => clearTimeout(timeoutId)
  }, [watermarkSize])

  // Función para manejar la selección de marca de agua personalizada
  const handleWatermarkFileSelect = useCallback((file: File) => {
    if (file && file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/)) {
      setWatermarkFile(file)
      const url = URL.createObjectURL(file)
      setWatermarkPreviewUrl(url)
    }
  }, [])

  // Función para aplicar marca de agua
  const applyWatermarkToCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    if (!applyWatermark) return

    try {
      // Cargar la imagen de marca de agua (personalizada o por defecto)
      const watermarkImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = watermarkPreviewUrl
      })

      // Calcular el tamaño de la marca de agua basado en el tamaño del canvas
      const watermarkWidth = Math.min(canvasWidth, canvasHeight) * debouncedWatermarkSize
      const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth

      // Calcular posición según la configuración
      const margin = 20
      let x: number, y: number

      switch (watermarkPosition) {
        case 'top-left':
          x = margin
          y = margin
          break
        case 'top-right':
          x = canvasWidth - watermarkWidth - margin
          y = margin
          break
        case 'bottom-left':
          x = margin
          y = canvasHeight - watermarkHeight - margin
          break
        case 'bottom-right':
          x = canvasWidth - watermarkWidth - margin
          y = canvasHeight - watermarkHeight - margin
          break
        case 'center':
          x = (canvasWidth - watermarkWidth) / 2
          y = (canvasHeight - watermarkHeight) / 2
          break
        default:
          x = canvasWidth - watermarkWidth - margin
          y = canvasHeight - watermarkHeight - margin
      }

      // Guardar el estado actual del contexto
      ctx.save()
      
      // Aplicar opacidad a la marca de agua
      ctx.globalAlpha = debouncedWatermarkOpacity
      
      // Dibujar la marca de agua
      ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight)
      
      // Restaurar el estado del contexto
      ctx.restore()
    } catch (error) {
      console.warn('No se pudo cargar la marca de agua:', error)
    }
  }, [applyWatermark, debouncedWatermarkOpacity, debouncedWatermarkSize, watermarkPreviewUrl, watermarkPosition])

  // Función rápida para solo agregar marca de agua a imagen ya procesada
  const addWatermarkOnly = useCallback(async (baseImageDataUrl: string, canvasWidth: number, canvasHeight: number, canvasRef: React.RefObject<HTMLCanvasElement | null>, outputFormat: string, quality: number) => {
    if (!applyWatermark || !canvasRef.current) return baseImageDataUrl

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return baseImageDataUrl

    try {
      // Cargar la imagen base
      const baseImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = baseImageDataUrl
      })

      // Configurar canvas
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      // Dibujar imagen base
      ctx.drawImage(baseImg, 0, 0, canvasWidth, canvasHeight)

      // Agregar marca de agua
      await applyWatermarkToCanvas(ctx, canvasWidth, canvasHeight)

      // Retornar nueva imagen con marca de agua
      return canvas.toDataURL(`image/${outputFormat}`, quality)
    } catch (error) {
      console.warn('Error agregando marca de agua:', error)
      return baseImageDataUrl
    }
  }, [applyWatermark, applyWatermarkToCanvas])

  return {
    // Estados
    applyWatermark,
    setApplyWatermark,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkSize,
    setWatermarkSize,
    watermarkFile,
    setWatermarkFile,
    watermarkPreviewUrl,
    setWatermarkPreviewUrl,
    watermarkPosition,
    setWatermarkPosition,
    watermarkFileInputRef,
    debouncedWatermarkOpacity,
    debouncedWatermarkSize,
    cachedBaseImage,
    setCachedBaseImage,
    cacheKey,
    setCacheKey,
    
    // Funciones
    handleWatermarkFileSelect,
    applyWatermarkToCanvas,
    addWatermarkOnly,
  }
}

export default useWatermark
