"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor } from "lucide-react"

interface ResponsivePopoverProps {
  generateResponsive: boolean
  setGenerateResponsive: (generate: boolean) => void
  downloadResponsiveImages: () => void
  optimizedUrl: string
  responsiveSizes: number[]
}

export const ResponsivePopover: React.FC<ResponsivePopoverProps> = ({
  generateResponsive,
  setGenerateResponsive,
  downloadResponsiveImages,
  optimizedUrl,
  responsiveSizes,
}) => (
  <PopoverContent className="w-80 p-0" align="start">
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Monitor className="w-4 h-4" />
          Pack Responsive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Genera automáticamente múltiples tamaños para sitios web responsive
          </p>
        </div>
        
        <div className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generateResponsive}
              onChange={(e) => setGenerateResponsive(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Activar pack responsive</span>
          </div>
        </div>
        
        {generateResponsive && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-foreground">
              📱 Se generarán {responsiveSizes.length} tamaños:
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {responsiveSizes.map((size) => (
                <div key={size} className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded text-center">
                  {size}px
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              💡 <strong>Para qué sirve:</strong> Los sitios web usan diferentes tamaños según el dispositivo (móvil, tablet, desktop) para cargar más rápido.
            </div>
            <Button
              onClick={downloadResponsiveImages}
              disabled={!optimizedUrl}
              variant="default"
              size="sm"
              className="w-full text-xs"
            >
              🌐 Descargar Pack Responsive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </PopoverContent>
)

export default ResponsivePopover
