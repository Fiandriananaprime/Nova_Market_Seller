import type { Layer, AdFormat, BackgroundFill, BrandColor, AutoLayoutConfig } from '@/features/product-studio/canvas/types/design'

   
                                                 
                                                                  
                                                                        
   
export interface Frame {
  id: string
  name: string
                                     
  x: number
  y: number
               
  width: number
  height: number
                              
  format: AdFormat
  backgroundColor: BrandColor
  backgroundFill: BackgroundFill
                             
  layers: Layer[]
                                                                                 
                                                                    
  autoLayouts?: Record<string, AutoLayoutConfig>
             
  locked: boolean
  visible: boolean
}

   
                                                  
                                                                      
   
export interface Page {
  id: string
  name: string
  frames: Frame[]
                                                                           
  looseElements: Layer[]
}

   
                                                              
   
export interface Workspace {
  id: string
  name: string
  pages: Page[]
  activePageId: string
                              
  showFrameLabels: boolean
  snapFrames: boolean
}
