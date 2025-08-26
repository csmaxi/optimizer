"use client"

import React from 'react'
import Image from 'next/image'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Upload, FileImage } from "lucide-react"

interface WatermarkPopoverProps {
  applyWatermark: boolean
  setApplyWatermark: (apply: boolean) => void
  watermarkFileInputRef: React.RefObject<HTMLInputElement | null>
  handleWatermarkFileSelect: (file: File) => void
  watermarkFile: File | null
  setWatermarkFile: (file: File | null) => void
  setWatermarkPreviewUrl: (url: string) => void
  watermarkPreviewUrl: string
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  setWatermarkPosition: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => void
  watermarkOpacity: number
  setWatermarkOpacity: (opacity: number) => void
  debouncedWatermarkOpacity: number
  watermarkSize: number
  setWatermarkSize: (size: number) => void
  debouncedWatermarkSize: number
}

export const WatermarkPopover: React.FC<WatermarkPopoverProps> = ({
  applyWatermark,
  setApplyWatermark,
  watermarkFileInputRef,
  handleWatermarkFileSelect,
  watermarkFile,
  setWatermarkFile,
  setWatermarkPreviewUrl,
  watermarkPreviewUrl,
  watermarkPosition,
  setWatermarkPosition,
  watermarkOpacity,
  setWatermarkOpacity,
  debouncedWatermarkOpacity,
  watermarkSize,
  setWatermarkSize,
  debouncedWatermarkSize,
}) => (
  <PopoverContent className="w-96 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileImage className="w-4 h-4" />
          Marca de Agua
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Sube tu propia marca de agua o usa la predeterminada Glacial.png
          </p>
        </div>
        
        <div className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyWatermark}
              onChange={(e) => setApplyWatermark(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Activar marca de agua</span>
          </div>
        </div>
        
        {applyWatermark && (
          <div className="space-y-4">
            {/* Subir Marca de Agua Personalizada */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">📁 Subir Marca de Agua</Label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => watermarkFileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Upload className="w-3 h-3 mr-2" />
                  Seleccionar Archivo
                </Button>
                <Button
                  onClick={() => {
                    setWatermarkFile(null)
                    setWatermarkPreviewUrl("/Glacial.png")
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Usar Glacial
                </Button>
              </div>
              
              {/* Preview de la marca de agua */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded border">
                <div className="w-8 h-8 bg-white rounded border flex items-center justify-center overflow-hidden">
                  <Image
                    src={watermarkPreviewUrl}
                    alt="Preview marca de agua"
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {watermarkFile ? watermarkFile.name : "Glacial.png (predeterminada)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {watermarkFile ? `${(watermarkFile.size / 1024).toFixed(1)} KB` : "Marca de agua por defecto"}
                  </p>
                </div>
              </div>
              
              <input
                ref={watermarkFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                onChange={(e) => e.target.files?.[0] && handleWatermarkFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            <Separator />

            {/* Control de Posición */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">📍 Posición</Label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: 'top-left', label: '↖', title: 'Superior Izquierda' },
                  { value: 'center', label: '●', title: 'Centro' },
                  { value: 'top-right', label: '↗', title: 'Superior Derecha' },
                  { value: 'bottom-left', label: '↙', title: 'Inferior Izquierda' },
                  { value: 'bottom-right', label: '↘', title: 'Inferior Derecha' },
                ].map((pos) => (
                  <Button
                    key={pos.value}
                    variant={watermarkPosition === pos.value ? "default" : "outline"}
                    onClick={() => setWatermarkPosition(pos.value as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center')}
                    className="text-xs h-8 p-0"
                    size="sm"
                    title={pos.title}
                  >
                    {pos.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Control de Opacidad */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Opacidad</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {Math.round(watermarkOpacity * 100)}%
                  </span>
                  {watermarkOpacity !== debouncedWatermarkOpacity && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Aplicando cambios..." />
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider-custom"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Control de Tamaño */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Tamaño</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {Math.round(watermarkSize * 100)}%
                  </span>
                  {watermarkSize !== debouncedWatermarkSize && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Aplicando cambios..." />
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer slider-custom"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded">
              ✨ <strong>Formatos soportados:</strong> JPG, PNG, WebP, SVG
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </PopoverContent>
)

export default WatermarkPopover
