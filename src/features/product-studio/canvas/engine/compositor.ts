import type { DesignDocument } from '@/features/product-studio/canvas/types/design'
import { renderLayer, type RenderOptions } from '@/features/product-studio/canvas/engine/layerRenderer'
import { captureDesignShaders } from '@/features/product-studio/canvas/engine/shaderCapture'

   
                                                                  
                                                                 
   
export const compositeDesign = (
  doc: DesignDocument,
  scale: number,
  opts?: RenderOptions,):HTMLCanvasElement => {
  const w = doc.format.width * scale
  const h = doc.format.height * scale

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')!

                          
  const sortedLayers = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex)

  for (const layer of sortedLayers) {
    renderLayer(ctx, layer, w, h, scale, opts)
  }

  return canvas
};

const createCanvas = (w: number, h: number):HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w)
  canvas.height = Math.round(h)
  return canvas
};

   
                                                                       
                                                       
   
export const renderToContext = (
  ctx: CanvasRenderingContext2D,
  doc: DesignDocument,
  scale: number,
  opts?: RenderOptions,) => {
  const w = doc.format.width * scale
  const h = doc.format.height * scale

  ctx.clearRect(0, 0, w, h)

  const sortedLayers = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex)

  for (const layer of sortedLayers) {
    if (opts?.hideLayerId && layer.id === opts.hideLayerId) continue
    renderLayer(ctx, layer, w, h, scale, opts)
  }
};

                 

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp'
  quality: number
  dpr: number
}

export const exportDesign = async (
  doc: DesignDocument,
  options: ExportOptions,):Promise<Blob> => {
                                                                           
                                                               
  const shaderCanvases = await captureDesignShaders(
    doc.layers,
    doc.format.width * options.dpr,
    doc.format.height * options.dpr,
  )
  const canvas = compositeDesign(doc, options.dpr, { shaderCanvases })

  const mimeType = options.format === 'png'
    ? 'image/png'
    : options.format === 'jpg'
      ? 'image/jpeg'
      : 'image/webp'

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      mimeType,
      options.format === 'png' ? undefined : options.quality,
    )
  })
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
};

export const exportAndDownload = async (
  doc: DesignDocument,
  options: ExportOptions,) => {
  const blob = await exportDesign(doc, options)
  const ext = options.format === 'jpg' ? 'jpg' : options.format
  const filename = `${doc.name.replace(/\s+/g, '-').toLowerCase()}-${doc.format.id}-${options.dpr}x.${ext}`
  downloadBlob(blob, filename)
};
