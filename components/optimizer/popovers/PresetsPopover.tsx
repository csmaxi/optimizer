"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SocialPreset {
  name: string
  platform: string
  width: number
  height: number
  icon: React.ReactNode
}

interface PresetsPopoverProps {
  presets: SocialPreset[]
  selectedPreset: SocialPreset | null
  onPresetSelect: (preset: SocialPreset) => void
  onCustomSizeChange: (width: number, height: number) => void
}

export default function PresetsPopover({
  presets,
  selectedPreset,
  onPresetSelect,
  onCustomSizeChange
}: PresetsPopoverProps) {
  const [customWidth, setCustomWidth] = React.useState(800)
  const [customHeight, setCustomHeight] = React.useState(600)

  const handleCustomSizeSubmit = () => {
    onCustomSizeChange(customWidth, customHeight)
  }

  return (
    <PopoverContent className="w-80 p-0" align="start">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Presets Sociales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets predefinidos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Formatos Populares</h4>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={selectedPreset?.name === preset.name ? "default" : "outline"}
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => onPresetSelect(preset)}
                >
                  <div className="text-primary">
                    {preset.icon}
                  </div>
                  <div className="text-xs text-center">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-muted-foreground">
                      {preset.width} × {preset.height}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tamaño personalizado */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Tamaño Personalizado</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ancho</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                  min="1"
                  max="4000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Alto</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                  min="1"
                  max="4000"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomSizeSubmit}
              size="sm"
              className="w-full"
            >
              Aplicar Tamaño
            </Button>
          </div>
        </CardContent>
      </Card>
    </PopoverContent>
  )
}
