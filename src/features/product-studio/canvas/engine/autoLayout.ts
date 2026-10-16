                                                                                
                                                                            
                                                                                 
                                                                  
  
                                          
                                                                 
                                    
                                                                               
                                                                              
                                                                         

import type { AutoLayoutConfig, AutoLayoutDirection } from '@/features/product-studio/canvas/types/design'

export interface LayoutChild {
  id: string
  width: number
  height: number
  layoutGrow?: boolean
}

export interface LayoutRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface AutoLayoutResult {
  rects: LayoutRect[]
                                                                                   
  width: number
  height: number
}

export const computeAutoLayout = (config: AutoLayoutConfig, children: LayoutChild[]):AutoLayoutResult => {
  const horiz = config.direction === 'horizontal'
  const { padding: pad, gap } = config

                                                            
  const primPadStart = horiz ? pad.left : pad.top
  const primPadEnd = horiz ? pad.right : pad.bottom
  const counterPadStart = horiz ? pad.top : pad.left
  const counterPadEnd = horiz ? pad.bottom : pad.right

  const primaryOf = (c: LayoutChild) => (horiz ? c.width : c.height)
  const counterOf = (c: LayoutChild) => (horiz ? c.height : c.width)

  const primaryHug = horiz ? config.widthMode === 'hug' : config.heightMode === 'hug'
  const counterHug = horiz ? config.heightMode === 'hug' : config.widthMode === 'hug'

  const n = children.length
  const totalGap = n > 1 ? gap * (n - 1) : 0

                                                                              
  const maxCounter = children.reduce((m, c) => Math.max(m, counterOf(c)), 0)
  const counterContainer = counterHug
    ? maxCounter + counterPadStart + counterPadEnd
    : horiz ? config.height : config.width
  const counterInner = counterContainer - counterPadStart - counterPadEnd

                                                                              
  const growers = children.filter((c) => c.layoutGrow)
  const fixedPrimarySum = children
    .filter((c) => !c.layoutGrow)
    .reduce((s, c) => s + primaryOf(c), 0)

                                                                               
                                                                           
  const primaryContainer = primaryHug
    ? childrenPrimaryExtent(children, primaryOf) + totalGap + primPadStart + primPadEnd
    : horiz ? config.width : config.height
  const primaryInner = primaryContainer - primPadStart - primPadEnd

  let growSize = 0
  if (!primaryHug && growers.length > 0) {
    const free = primaryInner - fixedPrimarySum - totalGap
    growSize = Math.max(0, free / growers.length)
  }
  const resolvedPrimary = (c: LayoutChild) =>
    c.layoutGrow && !primaryHug ? growSize : primaryOf(c)

                                                                              
  const usedPrimary = children.reduce((s, c) => s + resolvedPrimary(c), 0) + totalGap
  const freePrimary = primaryHug ? 0 : Math.max(0, primaryInner - usedPrimary)

  let cursor = primPadStart
  let betweenGap = gap
  if (!primaryHug) {
    if (config.primaryAlign === 'center') cursor += freePrimary / 2
    else if (config.primaryAlign === 'end') cursor += freePrimary
    else if (config.primaryAlign === 'space-between' && n > 1) {
                                                                        
      betweenGap = gap + freePrimary / (n - 1)
    }
  }

                                                                              
  const rects: LayoutRect[] = children.map((c) => {
    const primSize = resolvedPrimary(c)
    const primPos = cursor
    cursor += primSize + betweenGap

                                           
    const stretched = config.counterAlign === 'stretch'
    const counterSize = stretched ? counterInner : counterOf(c)
    let counterPos = counterPadStart
    if (!stretched) {
      const slack = counterInner - counterSize
      if (config.counterAlign === 'center') counterPos += slack / 2
      else if (config.counterAlign === 'end') counterPos += slack
    }

                                                                                      
    const x = config.x + (horiz ? primPos : counterPos)
    const y = config.y + (horiz ? counterPos : primPos)
    const width = horiz ? primSize : counterSize
    const height = horiz ? counterSize : primSize
    return { id: c.id, x: round(x), y: round(y), width: round(width), height: round(height) }
  })

  return {
    rects,
    width: round(horiz ? primaryContainer : counterContainer),
    height: round(horiz ? counterContainer : primaryContainer),
  }
};

const childrenPrimaryExtent = (children: LayoutChild[], primaryOf: (c: LayoutChild) => number):number => {
  return children.reduce((s, c) => s + primaryOf(c), 0)
};

const round = (n: number): number => Math.round(n * 100) / 100

                                                                                 

export interface InferInput {
  x: number
  y: number
  width: number
  height: number
}

   
                                                                              
                                                                             
                                                                            
                           
   
export const inferAutoLayout = (items: InferInput[]):{ direction: AutoLayoutDirection; gap: number } => {
  if (items.length < 2) return { direction: 'horizontal', gap: 0 }

  const xs = items.map((i) => i.x)
  const ys = items.map((i) => i.y)
  const spreadX = Math.max(...xs.map((x, k) => x + items[k].width)) - Math.min(...xs)
  const spreadY = Math.max(...ys.map((y, k) => y + items[k].height)) - Math.min(...ys)
  const direction: AutoLayoutDirection = spreadX >= spreadY ? 'horizontal' : 'vertical'

  const sorted = [...items].sort((a, b) =>
    direction === 'horizontal' ? a.x - b.x : a.y - b.y,
  )
  const gaps: number[] = []
  for (let k = 1; k < sorted.length; k++) {
    const prev = sorted[k - 1]
    const cur = sorted[k]
    const g = direction === 'horizontal'
      ? cur.x - (prev.x + prev.width)
      : cur.y - (prev.y + prev.height)
    gaps.push(g)
  }
  gaps.sort((a, b) => a - b)
  const median = gaps[Math.floor(gaps.length / 2)] ?? 0
  const gap = Math.max(0, Math.min(200, Math.round(median)))
  return { direction, gap }
};
