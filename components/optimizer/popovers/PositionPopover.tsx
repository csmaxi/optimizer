"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Move } from "lucide-react"

type ImagePosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
type ObjectFitMode = "cover" | "contain" | "fill"

interface PositionPopoverProps {
  imagePosition: ImagePosition
  setImagePosition: (position: ImagePosition) => void
  objectFit: ObjectFitMode
  setObjectFit: (fit: ObjectFitMode) => void
  rotation: number
  setRotation: (rotation: number) => void
}

export const PositionPopover: React.FC<PositionPopoverProps> = ({
  imagePosition,
  setImagePosition,
  objectFit,
  setObjectFit,
  rotation,
  setRotation,
}) => (
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
            {([
              "top-left", "top-center", "top-right",
              "center-left", "center", "center-right",
              "bottom-left", "bottom-center", "bottom-right"
            ] as const).map((position) => (
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
              onClick={() => setRotation((rotation + 90) % 360)}
              variant="outline"
              className="text-xs h-8"
              size="sm"
            >
              ↻ 90°
            </Button>
            <Button
              onClick={() => setRotation((rotation + 180) % 360)}
              variant="outline"
              className="text-xs h-8"
              size="sm"
            >
              ↻ 180°
            </Button>
            <Button
              onClick={() => setRotation((rotation + 270) % 360)}
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

export default PositionPopover
