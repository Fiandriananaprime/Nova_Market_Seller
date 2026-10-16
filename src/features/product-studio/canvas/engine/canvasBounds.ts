import type { Frame } from '@/features/product-studio/canvas/types/workspace'

                                                    
export const FRAME_CANVAS_PADDING = 120

                                                     
export const LABEL_HEIGHT = 28

   
                                                                  
   
export const computeCanvasBounds = (frames: Frame[]) => {
  if (frames.length === 0) return { originX: 0, originY: 0, totalW: 0, totalH: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const f of frames) {
    minX = Math.min(minX, f.x)
    minY = Math.min(minY, f.y - LABEL_HEIGHT)
    maxX = Math.max(maxX, f.x + f.width)
    maxY = Math.max(maxY, f.y + f.height)
  }

  return {
    originX: minX - FRAME_CANVAS_PADDING,
    originY: minY - FRAME_CANVAS_PADDING,
    totalW: maxX - minX + FRAME_CANVAS_PADDING * 2,
    totalH: maxY - minY + FRAME_CANVAS_PADDING * 2 + LABEL_HEIGHT,
  }
};
