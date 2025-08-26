"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface FormatQualityPopoverProps {
  outputFormat: "jpeg" | "png" | "webp" | "avif"
  setOutputFormat: (format: "jpeg" | "png" | "webp" | "avif") => void
}

export const FormatQualityPopover: React.FC<FormatQualityPopoverProps> = ({
  outputFormat,
  setOutputFormat,
}) => (
  <PopoverContent className="w-64 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Formato de Salida
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {(["jpeg", "png", "webp", "avif"] as const).map((format) => (
            <Button
              key={format}
              variant={outputFormat === format ? "default" : "outline"}
              onClick={() => setOutputFormat(format)}
              className="text-xs"
              size="sm"
            >
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </PopoverContent>
)

export default FormatQualityPopover
