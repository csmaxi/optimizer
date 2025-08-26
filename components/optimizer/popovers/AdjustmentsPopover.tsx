"use client"

import React, { useState, useMemo } from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sun, RotateCw } from "lucide-react"

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

interface AdjustmentsPopoverProps {
  brightness: number
  setBrightness: (brightness: number) => void
  contrast: number
  setContrast: (contrast: number) => void
  saturation: number
  setSaturation: (saturation: number) => void
}

export const AdjustmentsPopover: React.FC<AdjustmentsPopoverProps> = ({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
}) => {
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
    [setBrightness, setContrast, setSaturation]
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

export default AdjustmentsPopover
