import { useEffect, useState } from 'react'
import { SvgScene } from '@/features/product-studio/canvas/components/canvas/DesignSvgScene'
import { captureDesignShaders } from '@/features/product-studio/canvas/engine/shaderCapture'
import type { Frame } from '@/features/product-studio/canvas/types/workspace'
import type { DesignDocument } from '@/features/product-studio/canvas/types/design'

   
                                                                 
  
                                                                                
                                                                             
                                                                             
                                                                           
                           
   
export const FrameThumbnail = ({ frame, zoom }: { frame: Frame; zoom: number }) => {
  const [stills, setStills] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    captureDesignShaders(frame.layers, frame.format.width, frame.format.height).then(
      (canvases) => {
        if (cancelled || canvases.size === 0) return
        const map: Record<string, string> = {}
        canvases.forEach((canvas, id) => {
          map[id] = canvas.toDataURL('image/png')
        })
        setStills(map)
      },
    )
    return () => {
      cancelled = true
    }
  }, [frame.layers, frame.format.width, frame.format.height])

  const doc = { format: frame.format, layers: frame.layers } as DesignDocument
  return <SvgScene doc={doc} zoom={zoom} shaderStills={stills} className="block h-full w-full" />
};
