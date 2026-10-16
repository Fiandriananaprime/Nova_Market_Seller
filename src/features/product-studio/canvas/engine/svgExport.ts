import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SvgScene, type NaturalImageSize } from '@/features/product-studio/canvas/components/canvas/DesignSvgScene'
import { captureDesignShaders } from '@/features/product-studio/canvas/engine/shaderCapture'
import type { DesignDocument, ImageLayer } from '@/features/product-studio/canvas/types/design'

   
                                                                              
                                                                                
                                                                          
  
                                                                             
                                                                             
                                                                              
                                                                           
   
const loadNaturalImageSize = (url: string):Promise<NaturalImageSize | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
};

const loadCroppedImageSizes = async (doc: DesignDocument):Promise<Record<string, NaturalImageSize>> => {
  const urls = new Set(
    doc.layers
      .filter(
        (layer): layer is ImageLayer =>
          layer.type === 'image' &&
          (layer.cropX !== 0 || layer.cropY !== 0 || layer.cropW !== 1 || layer.cropH !== 1),
      )
      .map((layer) => layer.imageUrl),
  )

  const entries = await Promise.all(
    [...urls].map(async (url) => [url, await loadNaturalImageSize(url)] as const),
  )
  return Object.fromEntries(
    entries.filter((entry): entry is [string, NaturalImageSize] => Boolean(entry[1])),
  )
};

export const buildSvgMarkup = async (doc: DesignDocument):Promise<string> => {
                                                                               
                                                                                  
                                                                                
                                     
  const fw = doc.format?.width ?? 1200
  const fh = doc.format?.height ?? 627
  const [canvases, imageSizes] = await Promise.all([
    captureDesignShaders(doc.layers, fw, fh),
    loadCroppedImageSizes(doc),
  ])
  const shaderStills: Record<string, string> = {}
  canvases.forEach((canvas, id) => {
    shaderStills[id] = canvas.toDataURL('image/png')
  })

  const body = renderToStaticMarkup(
    createElement(SvgScene, { doc, zoom: 1, standalone: true, shaderStills, imageSizes }),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`
};

const safeFileName = (name: string):string => {
  return (name || 'design').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'design'
};

export const exportSvgAndDownload = async (doc: DesignDocument):Promise<void> => {
  const markup = await buildSvgMarkup(doc)
  const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = window.document.createElement('a')
  a.href = url
  a.download = `${safeFileName(doc.name)}.svg`
  a.click()
  URL.revokeObjectURL(url)
};
