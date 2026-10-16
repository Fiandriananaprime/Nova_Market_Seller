import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { useCoarsePointer } from '@/features/product-studio/canvas/hooks/useCoarsePointer'
import { getDrawPath } from '@/features/product-studio/canvas/engine/freehand'
import type { DrawLayer } from '@/features/product-studio/canvas/types/design'

const HOVER = '#2563eb'                                                           

interface Props {
  zoom: number
}

   
                                                                                 
                                                                             
                                                                                
                                                                                 
   
export const HoverOverlay = ({ zoom }: Props) => {
  const hoveredLayerId = useDesignStore((s) => s.hoveredLayerId)
  const selectedLayerIds = useDesignStore((s) => s.selectedLayerIds)
  const layers = useDesignStore((s) => s.document.layers)
  const coarse = useCoarsePointer()

  if (coarse || !hoveredLayerId || selectedLayerIds.has(hoveredLayerId)) return null
  const layer = layers.find((l) => l.id === hoveredLayerId)
  if (!layer || layer.type === 'background') return null

  const x = layer.x * zoom
  const y = layer.y * zoom
  const w = layer.width * zoom
  const h = layer.height * zoom
  const rot = layer.rotation || 0
  const rotate = rot ? ` rotate(${rot}, ${w / 2}, ${h / 2})` : ''

  return (
    <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {layer.type === 'draw' ? (
        // Highlight the ink itself: the stroke silhouette, tinted and outlined in
        // brand — reads as "thicker + brand colour" without moving the stroke.
        (() => {
          const dl = layer as DrawLayer
          const sx = dl.natWidth ? dl.width / dl.natWidth : 1
          const sy = dl.natHeight ? dl.height / dl.natHeight : 1
          const d = getDrawPath({
            points: dl.points,
            pressures: dl.pressures,
            size: dl.strokeWidth,
            mode: dl.mode,
            thinning: dl.thinning,
            taper: dl.taper,
            streamline: dl.streamline,
            last: true,
          })
          return (
            <g transform={`translate(${x}, ${y})${rotate} scale(${sx * zoom}, ${sy * zoom})`}>
              <path d={d} fill={HOVER} fillOpacity={0.18} stroke={HOVER} strokeOpacity={0.55} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </g>
          )
        })()
      ) : (
        // Everything else: a soft rounded outline around the box.
        <g transform={`translate(${x}, ${y})${rotate}`}>
          <rect x={0} y={0} width={w} height={h} fill="none" stroke={HOVER} strokeOpacity={0.5} strokeWidth={1.5} rx={2} />
        </g>
      )}
    </svg>
  )
};
