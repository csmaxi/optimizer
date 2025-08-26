"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Link2, ImageIcon } from "lucide-react"

interface LoadImagePopoverProps {
  imageUrl: string
  setImageUrl: (url: string) => void
  loadImageFromUrl: (url: string) => void
  isLoadingUrl: boolean
  urlError: string
  isDragging: boolean
  handleDrop: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (file: File) => void
  selectedImages: File[]
  setSelectedImages: (files: File[]) => void
  currentImageIndex: number
  setCurrentImageIndex: (index: number) => void
}

export const LoadImagePopover: React.FC<LoadImagePopoverProps> = ({
  imageUrl,
  setImageUrl,
  loadImageFromUrl,
  isLoadingUrl,
  urlError,
  isDragging,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  fileInputRef,
  handleFileSelect,
  selectedImages,
  setSelectedImages,
  currentImageIndex,
  setCurrentImageIndex,
}) => (
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

export default LoadImagePopover
