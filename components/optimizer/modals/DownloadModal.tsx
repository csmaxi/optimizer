"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Download, FileImage, X } from "lucide-react"

interface DownloadModalProps {
  showDownloadModal: boolean
  setShowDownloadModal: (show: boolean) => void
  fileName: string
  setFileName: (name: string) => void
  outputFormat: string
  handleDownloadWithCustomName: () => void
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  showDownloadModal,
  setShowDownloadModal,
  fileName,
  setFileName,
  outputFormat,
  handleDownloadWithCustomName,
}) => {
  if (!showDownloadModal) return null
  
  // Calcular la vista previa del nombre del archivo
  const trimmed = fileName.trim()
  const previewFileName = !trimmed ? `imagen.${outputFormat}` : 
    trimmed.endsWith(`.${outputFormat}`) ? trimmed : `${trimmed}.${outputFormat}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md bg-background border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Configurar Descarga</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDownloadModal(false)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nombre del archivo</Label>
            <Input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={`imagen.${outputFormat}`}
              className="w-full"
              autoFocus
              autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">
              La extensión .{outputFormat} se agregará automáticamente si no la incluyes
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-mono break-all">
                {previewFileName}
              </span>
            </div>
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-200 dark:border-blue-800">
              💡 <strong>Tip:</strong> Crea una carpeta &quot;Optimizer&quot; en Descargas y mueve los archivos allí después de descargarlos
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDownloadModal(false)}
              className="flex-1"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDownloadWithCustomName}
              disabled={!fileName.trim()}
              className="flex-1"
              type="button"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DownloadModal
