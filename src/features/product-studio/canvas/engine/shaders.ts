import type { ShaderFill, ShaderKind } from '@/features/product-studio/canvas/types/design'
import { BRAND_PALETTE } from '@/features/product-studio/canvas/brand/palette'

   
                                                                                 
                                                                                
   
export const SHADER_KINDS: { kind: ShaderKind; label: string; blurb: string }[] = [
  { kind: 'meshGradient', label: 'Mesh', blurb: 'Soft flowing color spots' },
  { kind: 'warp', label: 'Warp', blurb: 'Liquid, marbled bands' },
  { kind: 'grainGradient', label: 'Grain', blurb: 'Grainy gradient haze' },
  { kind: 'swirl', label: 'Swirl', blurb: 'Concentric vortex rings' },
  { kind: 'dithering', label: 'Dither', blurb: 'Retro halftone two-tone' },
  { kind: 'waves', label: 'Waves', blurb: 'Rolling line waves' },
]

const hex = (token: string) => BRAND_PALETTE[token]?.hex ?? '#2563eb'

   
                                                                             
                                                                        
   
export const SHADER_PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Brand', colors: [hex('brand-primary'), hex('brand-dark'), hex('brand-accent')] },
  { name: 'Ember', colors: [hex('ember-300'), hex('ember-500'), hex('ember-700')] },
  { name: 'Teal', colors: [hex('teal-200'), hex('teal-400'), hex('teal-700')] },
  { name: 'Gold', colors: [hex('gold-200'), hex('gold-400'), hex('gold-600')] },
  { name: 'Dusk', colors: [hex('brand-dark'), hex('ember-500'), hex('gold-300')] },
  { name: 'Pastel', colors: [hex('sky'), hex('lime'), hex('sherbet')] },
  { name: 'Mono', colors: [hex('charcoal'), hex('sea'), hex('cloud')] },
]

                                                                                 
const DITHER_DEFAULT = [hex('brand-primary'), hex('cloud')]

export const defaultColorsFor = (kind: ShaderKind):string[] => {
  if (kind === 'dithering') return DITHER_DEFAULT
  return SHADER_PALETTES[0].colors
};

export const createShaderFill = (kind: ShaderKind = 'meshGradient'):ShaderFill => {
  return {
    type: 'shader',
    kind,
    colors: defaultColorsFor(kind),
    speed: 1,
    frame: 0,
    intensity: 0.6,
    scale: 1,
    rotation: 0,
    grain: 0,
  }
};

   
                                                                            
                                                                                 
                                               
   
export const FRAME_STEP_MS = 1200
