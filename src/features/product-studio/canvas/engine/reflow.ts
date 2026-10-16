import type { Layer, HorizontalAnchor, VerticalAnchor } from '@/features/product-studio/canvas/types/design'
import { CONSTRAINTS_DEFAULT } from '@/features/product-studio/canvas/types/design'

export interface Size {
  width: number
  height: number
}

   
                                                                          
                                                                         
  
                                                                          
                                                                            
                                                                             
                                                                             
                                                                             
                                                                                  
   
export const reflowLayers = (layers: Layer[], from: Size, to: Size):Layer[] => {
  if (from.width === to.width && from.height === to.height) return layers
  const sx = to.width / from.width
  const sy = to.height / from.height
  const sMin = Math.min(sx, sy)

  return layers.map((l) => {
                                                 
    if (l.type === 'background') {
      return { ...l, x: 0, y: 0, width: to.width, height: to.height }
    }

    const c = l.constraints ?? CONSTRAINTS_DEFAULT

                                                                                  
                                                                           
    let w = l.width
    let h = l.height
    if (c.scale === 'proportional') {
      w = l.width * sMin
      h = l.height * sMin
    } else if (c.scale === 'stretch') {
      w = l.width * sx
      h = l.height * sy
    }

                                                                            
                                                                     
    if (c.horizontal === 'stretch') w = to.width - marginStart(l.x) - marginEnd(from.width, l.x, l.width)
    if (c.vertical === 'stretch') h = to.height - marginStart(l.y) - marginEnd(from.height, l.y, l.height)

    const x = placeAxis(c.horizontal, l.x, l.width, w, from.width, to.width)
    const y = placeAxis(c.vertical, l.y, l.height, h, from.height, to.height)

    const out = {
      ...l,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.max(1, Math.round(w)),
      height: Math.max(1, Math.round(h)),
    }

                                                                                 
                                                    
    if ('fontSize' in out && c.scale !== 'fixed') {
      ;(out as { fontSize: number }).fontSize = Math.max(1, Math.round((out as { fontSize: number }).fontSize * sMin))
    }

    return out as Layer
  })
};

const marginStart = (pos: number) => pos
const marginEnd = (frame: number, pos: number, size: number) => frame - (pos + size)

   
                                                                               
                                                                                
                                                                        
   
const placeAxis = (
  anchor: HorizontalAnchor | VerticalAnchor,
  oldPos: number,
  oldSize: number,
  newSize: number,
  oldFrame: number,
  newFrame: number,):number => {
  switch (anchor) {
    case 'left':
    case 'top':
      return oldPos
    case 'right':
    case 'bottom':
      return newFrame - marginEnd(oldFrame, oldPos, oldSize) - newSize
    case 'stretch':
                                                                            
      return oldPos
    case 'center':
    default: {
      const relCentre = (oldPos + oldSize / 2) / oldFrame
      return relCentre * newFrame - newSize / 2
    }
  }
};
