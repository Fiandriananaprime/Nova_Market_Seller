import { nanoid } from 'nanoid'
import type { DesignDocument, AdFormat, Layer, BackgroundLayer } from '@/features/product-studio/canvas/types/design'

   
                                                                   
                                                                  
                                                                          
   
export const autoResize = (
  source: DesignDocument,
  targetFormat: AdFormat,):DesignDocument => {
  const srcW = source.format.width
  const srcH = source.format.height
  const tgtW = targetFormat.width
  const tgtH = targetFormat.height

                                                                                    
  const scaleX = tgtW / srcW
  const scaleY = tgtH / srcH
  const uniformScale = Math.min(scaleX, scaleY)

  const resizedLayers = source.layers.map((layer): Layer => {
    if (layer.type === 'background') {
      return {
        ...layer,
        id: nanoid(),
        width: tgtW,
        height: tgtH,
      } as BackgroundLayer
    }

                                                                     
    const newWidth = Math.round(layer.width * uniformScale)
    const newHeight = Math.round(layer.height * uniformScale)

                                                             
    const relX = (layer.x + layer.width / 2) / srcW
    const relY = (layer.y + layer.height / 2) / srcH

                                            
    const newX = Math.round(relX * tgtW - newWidth / 2)
    const newY = Math.round(relY * tgtH - newHeight / 2)

    const scaled: Layer = {
      ...layer,
      id: nanoid(),
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    }

                                      
    if (scaled.type === 'text') {
      return {
        ...scaled,
        fontSize: Math.round(scaled.fontSize * uniformScale),
      }
    }

                                                 
    if (scaled.type === 'image') {
      return {
        ...scaled,
        borderRadius: Math.round(scaled.borderRadius * uniformScale),
      }
    }

    if (scaled.type === 'shape') {
      return {
        ...scaled,
        borderRadius: Math.round(scaled.borderRadius * uniformScale),
      }
    }

    return scaled
  })

  return {
    ...source,
    id: nanoid(),
    name: `${source.name} (${targetFormat.label})`,
    format: targetFormat,
    layers: resizedLayers,
    updatedAt: new Date().toISOString(),
  }
};
