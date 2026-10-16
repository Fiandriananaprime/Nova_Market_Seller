                                                                             
                                                                                
                                                                              
                                                                               
                                                                                 
                                                                     

const MAX_SIDE = 200

export interface SvgIntrinsic {
  svgContent: string
  width: number
  height: number
}

const round = (n: number): number => Math.round(n * 100) / 100

                                                                                 
const fitToBox = (w: number, h: number):{ width: number; height: number } => {
  const scale = MAX_SIDE / Math.max(w, h)
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) }
};

                                                                     
const declaredSize = (svg: SVGSVGElement):[number, number] | null => {
  const vb = svg.getAttribute('viewBox')
  if (vb) {
    const p = vb.split(/[\s,]+/).map(Number)
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return [p[2], p[3]]
  }
  const w = parseFloat(svg.getAttribute('width') ?? '')
  const h = parseFloat(svg.getAttribute('height') ?? '')
  if (w > 0 && h > 0) return [w, h]
  return null
};

   
                                                                               
                                                                              
                                                                              
                                                                       
   
export const measureImportedSvg = (svgContent: string):SvgIntrinsic => {
  const fallback = (): SvgIntrinsic => ({ svgContent, width: MAX_SIDE, height: MAX_SIDE })
  if (typeof document === 'undefined') return fallback()

  let svgEl: SVGSVGElement
  try {
    const doc = new DOMParser().parseFromString(svgContent, 'image/svg+xml')
    if (doc.querySelector('parsererror')) return fallback()
    const root = doc.documentElement
    if (root.tagName.toLowerCase() !== 'svg') return fallback()
    svgEl = document.importNode(root, true) as unknown as SVGSVGElement
  } catch {
    return fallback()
  }

  const declared = declaredSize(svgEl)

                                                                            
                                                                    
  const holder = document.createElement('div')
  holder.setAttribute('style', 'position:absolute;left:-99999px;top:0;width:0;height:0;overflow:hidden;')
  svgEl.removeAttribute('width')
  svgEl.removeAttribute('height')
  holder.appendChild(svgEl)
  document.body.appendChild(holder)

  let box: { x: number; y: number; width: number; height: number } | null = null
  try {
    const b = svgEl.getBBox()
    if (b.width > 0.01 && b.height > 0.01) box = { x: b.x, y: b.y, width: b.width, height: b.height }
  } catch {
    box = null
  }
  document.body.removeChild(holder)

  if (box) {
                                                                               
    svgEl.setAttribute('viewBox', `${round(box.x)} ${round(box.y)} ${round(box.width)} ${round(box.height)}`)
    const out = new XMLSerializer().serializeToString(svgEl)
    return { svgContent: out, ...fitToBox(box.width, box.height) }
  }

  if (declared) {
    // Keep markup as-is (its viewBox already frames the art); just match aspect.
    return { svgContent, ...fitToBox(declared[0], declared[1]) }
  }

  return fallback()
};
