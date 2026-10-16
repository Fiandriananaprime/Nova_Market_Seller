   
                                             
  
                             
                                    
                                             
                 
   

import type { Layer, AdFormat, BackgroundFill, AutoLayoutConfig } from '@/features/product-studio/canvas/types/design'

export interface DesignFrame {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  format: AdFormat
  backgroundFill: BackgroundFill
  layers: Layer[]
  autoLayouts?: Record<string, AutoLayoutConfig>
}

export interface DesignPage {
  id: string
  name: string
  frames: DesignFrame[]
}

export interface DesignFile {
  id: string
  name: string
  folderId: string | null                     
  pages: DesignPage[]
  thumbnailUrl?: string
  isScratchpad?: boolean
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null                     
  createdAt: string
}
