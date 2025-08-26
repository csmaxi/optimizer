"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

interface CropOverlayProps {
  onCrop: (data: {x: number, y: number, width: number, height: number}) => void
  aspectRatio: string
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ onCrop, aspectRatio }) => {
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

export default CropOverlay
