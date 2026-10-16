import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { getBrandColor } from '@/features/product-studio/canvas/brand/palette'
import type { Layer, TextLayer, ShapeLayer, BackgroundLayer } from '@/features/product-studio/canvas/types/design'

   
                                                                          
                                                                              
                                                                           
                                                                
   
export const applyDesignJson = (jsonText: string):boolean => {
  try {
    const jsonMatch = jsonText.match(/```json?\s*\n?([\s\S]*?)```/)
    const raw = jsonMatch ? jsonMatch[1].trim() : jsonText.trim()
    const arrayMatch = raw.match(/\[[\s\S]*\]/)
    if (!arrayMatch) return false
    const layers = JSON.parse(arrayMatch[0])
    if (!Array.isArray(layers)) return false

    const store = useDesignStore.getState()
    const format = store.document.format
    store.pushSnapshot()

                                                           
    const existing = store.document.layers.filter((l) => l.type !== 'background')
    for (const l of existing) store.removeLayer(l.id)

    for (const layer of layers) {
      if (layer.type === 'text') {
        store.addLayer({
          type: 'text',
          name: layer.name || 'AI Text',
          visible: true, locked: false, opacity: 1,
          x: layer.x, y: layer.y, width: layer.width, height: layer.height,
          rotation: 0,
          content: layer.content,
          fontSize: layer.fontSize || 32,
          fontWeight: layer.fontWeight || 400,
          textAlign: layer.textAlign || 'left',
          color: getBrandColor(layer.colorToken || 'charcoal'),
          letterSpacing: layer.letterSpacing ?? -0.01,
          lineHeight: layer.lineHeight ?? 1.2,
          textTransform: layer.textTransform || 'none',
          textWrap: 'pretty',
          textSizing: 'fixed',
          textRole: 'none',
          verticalAlign: 'top',
        } as Omit<TextLayer, 'id' | 'zIndex'>)
      } else if (layer.type === 'shape') {
                                                                             
        if (layer.x === 0 && layer.y === 0 && layer.width >= format.width && layer.height >= format.height) {
          const bgLayer = store.document.layers.find((l) => l.type === 'background')
          if (bgLayer) {
            store.updateLayer<BackgroundLayer>(bgLayer.id, {
              fill: { type: 'solid', color: getBrandColor(layer.colorToken || 'cloud') },
            })
          }
        } else {
          store.addLayer({
            type: 'shape',
            name: layer.name || 'AI Shape',
            visible: true, locked: false, opacity: 1,
            x: layer.x, y: layer.y, width: layer.width, height: layer.height,
            rotation: 0,
            shape: layer.shape || 'rectangle',
            fill: getBrandColor(layer.colorToken || 'brand-dark'),
            borderRadius: layer.borderRadius ?? 7,
          } as Omit<ShapeLayer, 'id' | 'zIndex'>)
        }
      }
    }
    return true
  } catch {
    return false
  }
};

   
                                                                             
                                                                             
                                                              
   
export const serializeLayersForAI = (layers: Layer[]) => {
  return layers
    .filter((l) => l.type === 'text' || l.type === 'shape')
    .map((l) => {
      if (l.type === 'text') {
        const t = l as TextLayer
        return {
          type: 'text' as const,
          content: t.content,
          fontSize: t.fontSize,
          fontWeight: t.fontWeight,
          textAlign: t.textAlign,
          colorToken: t.color.token,
        }
      }
      const s = l as ShapeLayer
      return {
        type: 'shape' as const,
        shape: s.shape,
        colorToken: s.fill.token,
        borderRadius: s.borderRadius,
      }
    })
};
