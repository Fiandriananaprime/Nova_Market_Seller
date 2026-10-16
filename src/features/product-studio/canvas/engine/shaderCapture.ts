import { createRoot, type Root } from 'react-dom/client'
                                                                    
                                                                            
                                                                           
import { isPaperShaderElement } from '@paper-design/shaders-react'
import type { ShaderFill } from '@/features/product-studio/canvas/types/design'
import { renderShaderElement } from '@/features/product-studio/canvas/engine/renderShaderElement'

   
                                                                                    
  
                                                                             
                                                                             
                                                                                
                                                                               
  
                                                                                 
                                                      
   

const cache = new Map<string, HTMLCanvasElement>()

const signature = (fill: ShaderFill, w: number, h: number):string => {
  return JSON.stringify([fill.kind, fill.colors, fill.frame, fill.intensity, fill.scale, fill.rotation, fill.grain, w, h])
};

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

const findShaderMount = (host: HTMLElement) => {
  for (const node of [host, ...host.querySelectorAll<HTMLElement>('*')]) {
    if (isPaperShaderElement(node)) return node.paperShaderMount
  }
  return undefined
};

const solidFallback = (fill: ShaderFill, w: number, h: number):HTMLCanvasElement => {
  const c = document.createElement('canvas')
  c.width = Math.round(w)
  c.height = Math.round(h)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = fill.colors[0] ?? '#2563eb'
  ctx.fillRect(0, 0, c.width, c.height)
  return c
};

export const captureShaderFrame = async (
  fill: ShaderFill,
  width: number,
  height: number,):Promise<HTMLCanvasElement> => {
  const key = signature(fill, width, height)
  const hit = cache.get(key)
  if (hit) return hit

  const host = document.createElement('div')
  host.style.cssText =
    `position:fixed;left:-99999px;top:0;width:${Math.round(width)}px;height:${Math.round(height)}px;` +
    `pointer-events:none;opacity:0;z-index:-1;`
  document.body.appendChild(host)

  let root: Root | null = null
  try {
    root = createRoot(host)
    // Freeze at the chosen frame so the still is reproducible.
    root.render(renderShaderElement(fill, { speed: 0, frame: fill.frame }))

    // Wait for the WebGL canvas to mount and size itself (ResizeObserver is async).
    let webglCanvas: HTMLCanvasElement | null = null
    for (let i = 0; i < 40; i++) {
      await nextFrame()
      const found = host.querySelector('canvas')
      if (found && found.width > 0 && found.height > 0) {
        webglCanvas = found
        break
      }
    }
    if (!webglCanvas) return solidFallback(fill, width, height)

    // Force a deterministic render at exactly this frame, then give the GPU a beat.
    findShaderMount(host)?.setFrame(fill.frame)
    await nextFrame()

    // Copy WebGL pixels into a detached 2D canvas before we unmount.
    const out = document.createElement('canvas')
    out.width = webglCanvas.width
    out.height = webglCanvas.height
    out.getContext('2d')!.drawImage(webglCanvas, 0, 0)

    cache.set(key, out)
    return out
  } catch {
    return solidFallback(fill, width, height)
  } finally {
    // Defer unmount one tick to avoid React's "synchronous unmount during render" warning.
    const r = root
    setTimeout(() => {
      r?.unmount()
      host.remove()
    }, 0)
  }
};

/** Collect shader-background captures for a document, keyed by layer id. */
export const captureDesignShaders = async (
  layers: { id: string; type: string; fill?: unknown }[],
  width: number,
  height: number,):Promise<Map<string, HTMLCanvasElement>> => {
  const map = new Map<string, HTMLCanvasElement>()
  for (const layer of layers) {
    if (layer.type !== 'background') continue
    const fill = layer.fill as ShaderFill | undefined
    if (fill?.type !== 'shader') continue
    map.set(layer.id, await captureShaderFrame(fill, width, height))
  }
  return map
};
