"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Grid3x3 } from "lucide-react"

interface SocialPreset {
  name: string
  platform: string
  width: number
  height: number
  icon: React.ReactNode
}

interface PresetsPopoverProps {
  socialPresets: SocialPreset[]
  selectedPreset: SocialPreset | null
  handlePresetClick: (preset: SocialPreset) => void
}

export const PresetsPopover: React.FC<PresetsPopoverProps> = ({
  socialPresets,
  selectedPreset,
  handlePresetClick,
}) => (
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

export default PresetsPopover
