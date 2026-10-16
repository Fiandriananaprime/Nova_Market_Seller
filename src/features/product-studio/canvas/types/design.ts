export type LayerId = string

export type Platform = 'linkedin' | 'instagram' | 'facebook' | 'generic'

export interface AdFormat {
  id: string
  label: string
  platform: Platform
  width: number
  height: number
  aspectRatio: string
}

                                

export interface BrandColor {
  token: string
  hex: string
}

                       

export type LayerType = 'background' | 'text' | 'image' | 'svg' | 'shape' | 'gradient' | 'group' | 'draw'

export interface LayerBase {
  id: LayerId
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  aspectRatioLocked?: boolean
                                                                                
                                                                               
  flipH?: boolean
  flipV?: boolean
                                                                     
                                                                       
  constraints?: LayerConstraints
                                                                                
                                                                                
                                                
  groupId?: string
                                                                        
                                                                               
                                                                             
  layoutGrow?: boolean
            
  shadow?: DropShadow
  blur?: number
}

export interface DropShadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string                                           
}

                           

export type BackgroundFillType = 'solid' | 'gradient' | 'image' | 'shader'

export interface SolidFill {
  type: 'solid'
  color: BrandColor
}

export interface GradientStop {
  position: number
  color: BrandColor
}

export interface GradientFill {
  type: 'gradient'
  gradientType: 'linear' | 'radial'
  angle: number
  stops: GradientStop[]
}

export interface ImageFill {
  type: 'image'
  imageUrl: string
  fit: 'cover' | 'contain' | 'fill'
}

   
                                                                
                                                                                
                                                                                   
                                                                                 
                                 
   
export type ShaderKind =
  | 'meshGradient'
  | 'warp'
  | 'grainGradient'
  | 'swirl'
  | 'dithering'
  | 'waves'

export interface ShaderFill {
  type: 'shader'
  kind: ShaderKind
                                                                            
  colors: string[]
                                                                                        
  speed: number
                                                                             
  frame: number
                                                                                    
  intensity: number
                               
  scale: number
                                             
  rotation: number
                                
  grain: number
}

export type BackgroundFill = SolidFill | GradientFill | ImageFill | ShaderFill

export interface BackgroundLayer extends LayerBase {
  type: 'background'
  fill: BackgroundFill
}

                     

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type TextWrap = 'normal' | 'balance' | 'pretty'
export type TextSizing = 'fixed' | 'auto-width' | 'auto-height'
export type TextRole = 'none' | 'headline' | 'subheadline' | 'body' | 'cta' | 'tagline' | 'job-title' | 'company'

export interface TextLayer extends LayerBase {
  type: 'text'
  content: string
  fontSize: number
  fontWeight: FontWeight
  textAlign: 'left' | 'center' | 'right'
  color: BrandColor
  letterSpacing: number
  lineHeight: number
  textTransform: 'none' | 'uppercase' | 'lowercase'
  textWrap?: TextWrap
  textSizing?: TextSizing
  textRole?: TextRole
  underline?: boolean
  strikethrough?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
                                                                             
                                                                              
                                                                            
                                                 
  verticalTrim?: 'standard' | 'cap'
}

                      

export interface ImageLayer extends LayerBase {
  type: 'image'
  imageUrl: string
  fit: 'cover' | 'contain' | 'fill'
  cropX: number
  cropY: number
  cropW: number
  cropH: number
  borderRadius: number
                                                                               
                                                                                 
  avatarSet?: boolean
}

                    

export interface SvgLayer extends LayerBase {
  type: 'svg'
  svgContent: string
                                                                                 
  tintColor?: BrandColor
                                                                             
                                                                               
                                                                
  colorOverrides?: Record<string, BrandColor>
                                                                                    
  strokeWidth?: number
}

                      

export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'pill' | 'triangle' | 'star'

export type LineCap = 'butt' | 'round' | 'square'

export interface ShapeLayer extends LayerBase {
  type: 'shape'
  shape: ShapeType
  fill: BrandColor
  stroke?: { color: BrandColor; width: number }
  borderRadius: number
                  
  lineCap?: LineCap
                                       
  arrowStart?: boolean
  arrowEnd?: boolean
                                                                        
  controlPointX?: number
  controlPointY?: number
}

                         

export type GradientType = 'linear' | 'radial' | 'conic' | 'mesh'

export interface GradientColorStop {
  position: number
                                                        
  oklchL: number                 
  oklchC: number                
  oklchH: number             
  alpha: number        
}

export interface GradientLayer extends LayerBase {
  type: 'gradient'
  gradientType: GradientType
  angle: number                       
  stops: GradientColorStop[]
  grain: number                               
  borderRadius: number
}

                      

export interface GroupLayer extends LayerBase {
  type: 'group'
  childIds: LayerId[]
}

                

                                                                             
                                                                              
                               
export type DrawMode = 'pen' | 'highlighter'

export interface DrawLayer extends LayerBase {
  type: 'draw'
  points: [number, number][]
  color: BrandColor
  strokeWidth: number
                                                                           
                                                                            
                                                                                 
  natWidth: number
  natHeight: number
                                                                             
                                                                                
                                                       
                                                                               
                                                     
  mode?: DrawMode
                                                                                 
  pressures?: number[]
                                                                                 
  thinning?: number
                                                                                
  taper?: number
                                                                                        
  streamline?: number
}

export type Layer = BackgroundLayer | TextLayer | ImageLayer | SvgLayer | ShapeLayer | GradientLayer | GroupLayer | DrawLayer
export type LayerInput = Layer extends infer T
  ? T extends Layer
    ? Omit<T, 'id' | 'zIndex'>
    : never
  : never

                          

                                                                                
                                                                                 
                                                                            
                                                                                  
                                                                                
                                                                      

export type AutoLayoutDirection = 'horizontal' | 'vertical'
export type AutoLayoutPrimaryAlign = 'start' | 'center' | 'end' | 'space-between'
export type AutoLayoutCounterAlign = 'start' | 'center' | 'end' | 'stretch'
export type AutoLayoutSizing = 'fixed' | 'hug'

export interface AutoLayoutPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface AutoLayoutConfig {
  direction: AutoLayoutDirection
  gap: number
  padding: AutoLayoutPadding
  primaryAlign: AutoLayoutPrimaryAlign
  counterAlign: AutoLayoutCounterAlign
  widthMode: AutoLayoutSizing
  heightMode: AutoLayoutSizing
                                                                                 
                                                                                  
                                                                
  x: number
  y: number
  width: number
  height: number
                                                                                 
                                                                                 
                                                                             
  parentGroupId?: string
}

export interface DesignDocument {
  id: string
  name: string
  format: AdFormat
  layers: Layer[]
  createdAt: string
  updatedAt: string
                                                                            
  autoLayouts?: Record<string, AutoLayoutConfig>
}

                     

export type ToolMode = 'select' | 'text' | 'shape' | 'pan' | 'comment' | 'draw' | 'eraser'

                              

                                                                               
                                                                           
                                                                               
                                                                           
                                                                           
export type HorizontalAnchor = 'left' | 'center' | 'right' | 'stretch'
export type VerticalAnchor = 'top' | 'center' | 'bottom' | 'stretch'
export type ScaleMode = 'proportional' | 'fixed' | 'stretch'

export interface LayerConstraints {
  horizontal: HorizontalAnchor
  vertical: VerticalAnchor
  scale: ScaleMode
}

                                                                          
                                                                                   
export const CONSTRAINTS_DEFAULT: LayerConstraints = {
  horizontal: 'center',
  vertical: 'center',
  scale: 'proportional',
}
