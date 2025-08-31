"use client"

import React from 'react'
import { PopoverContent } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin,
  Camera,
  Smartphone,
  Monitor,
  Video,
  Users,
  Sparkles
} from "lucide-react"

interface SocialTemplate {
  id: string
  name: string
  platform: string
  width: number
  height: number
  icon: React.ReactNode
  description: string
  category: 'post' | 'story' | 'cover' | 'ad' | 'thumbnail'
  color: string
}

interface SocialTemplatesPopoverProps {
  onTemplateSelect: (template: SocialTemplate) => void
  selectedTemplate?: SocialTemplate | null
}

const socialTemplates: SocialTemplate[] = [
  // Instagram
  {
    id: 'ig-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    icon: <Instagram className="w-4 h-4" />,
    description: 'Post cuadrado estándar',
    category: 'post',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'ig-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Historia vertical 9:16',
    category: 'story',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'ig-reel',
    name: 'Instagram Reel',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    icon: <Video className="w-4 h-4" />,
    description: 'Video vertical para Reels',
    category: 'story',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  
  // Facebook
  {
    id: 'fb-post',
    name: 'Facebook Post',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    icon: <Facebook className="w-4 h-4" />,
    description: 'Post horizontal estándar',
    category: 'post',
    color: 'bg-blue-600'
  },
  {
    id: 'fb-cover',
    name: 'Facebook Cover',
    platform: 'Facebook',
    width: 820,
    height: 312,
    icon: <Monitor className="w-4 h-4" />,
    description: 'Portada de página/perfil',
    category: 'cover',
    color: 'bg-blue-600'
  },
  {
    id: 'fb-story',
    name: 'Facebook Story',
    platform: 'Facebook',
    width: 1080,
    height: 1920,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Historia vertical',
    category: 'story',
    color: 'bg-blue-600'
  },
  
  // Twitter/X
  {
    id: 'x-post',
    name: 'X/Twitter Post',
    platform: 'X/Twitter',
    width: 1200,
    height: 675,
    icon: <Twitter className="w-4 h-4" />,
    description: 'Tweet con imagen',
    category: 'post',
    color: 'bg-black'
  },
  {
    id: 'x-header',
    name: 'X/Twitter Header',
    platform: 'X/Twitter',
    width: 1500,
    height: 500,
    icon: <Monitor className="w-4 h-4" />,
    description: 'Banner de perfil',
    category: 'cover',
    color: 'bg-black'
  },
  
  // LinkedIn
  {
    id: 'li-post',
    name: 'LinkedIn Post',
    platform: 'LinkedIn',
    width: 1200,
    height: 627,
    icon: <Linkedin className="w-4 h-4" />,
    description: 'Post profesional',
    category: 'post',
    color: 'bg-blue-700'
  },
  {
    id: 'li-cover',
    name: 'LinkedIn Cover',
    platform: 'LinkedIn',
    width: 1584,
    height: 396,
    icon: <Users className="w-4 h-4" />,
    description: 'Banner de perfil profesional',
    category: 'cover',
    color: 'bg-blue-700'
  },
  
  // YouTube
  {
    id: 'yt-thumbnail',
    name: 'YouTube Thumbnail',
    platform: 'YouTube',
    width: 1280,
    height: 720,
    icon: <Youtube className="w-4 h-4" />,
    description: 'Miniatura de video HD',
    category: 'thumbnail',
    color: 'bg-red-600'
  },
  {
    id: 'yt-banner',
    name: 'YouTube Banner',
    platform: 'YouTube',
    width: 2560,
    height: 1440,
    icon: <Monitor className="w-4 h-4" />,
    description: 'Banner de canal',
    category: 'cover',
    color: 'bg-red-600'
  },
  
  // TikTok
  {
    id: 'tt-video',
    name: 'TikTok Video',
    platform: 'TikTok',
    width: 1080,
    height: 1920,
    icon: <Video className="w-4 h-4" />,
    description: 'Video vertical 9:16',
    category: 'story',
    color: 'bg-gradient-to-r from-pink-500 to-purple-600'
  },
  
  // Pinterest
  {
    id: 'pin-standard',
    name: 'Pinterest Pin',
    platform: 'Pinterest',
    width: 1000,
    height: 1500,
    icon: <Camera className="w-4 h-4" />,
    description: 'Pin estándar 2:3',
    category: 'post',
    color: 'bg-red-500'
  },
  
  // WhatsApp
  {
    id: 'wa-status',
    name: 'WhatsApp Status',
    platform: 'WhatsApp',
    width: 1080,
    height: 1920,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Estado vertical',
    category: 'story',
    color: 'bg-green-600'
  }
]

const categoryLabels = {
  post: 'Posts',
  story: 'Historias',
  cover: 'Portadas',
  ad: 'Anuncios',
  thumbnail: 'Miniaturas'
}

export const SocialTemplatesPopover: React.FC<SocialTemplatesPopoverProps> = ({
  onTemplateSelect,
  selectedTemplate
}) => {
  const categories = Array.from(new Set(socialTemplates.map(t => t.category)))

  return (
    <PopoverContent className="w-[480px] p-0 max-h-[600px] overflow-y-auto" align="start">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4" />
            Plantillas de Redes Sociales
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Selecciona una plantilla optimizada para cada plataforma
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {categoryLabels[category]}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {socialTemplates
                  .filter(template => template.category === category)
                  .map(template => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      onClick={() => onTemplateSelect(template)}
                      className="h-auto p-3 flex flex-col items-start gap-2 text-left"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`p-1.5 rounded ${template.color} text-white`}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {template.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {template.platform}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {template.width} × {template.height}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {(template.width / template.height).toFixed(2)}:1
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
              
              {category !== categories[categories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
          
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3 h-3 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Consejo Pro
                </p>
                <p className="text-blue-700 dark:text-blue-200">
                  Estas dimensiones están optimizadas para cada plataforma y garantizan la mejor calidad de visualización.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PopoverContent>
  )
}

export default SocialTemplatesPopover
