   
                                                                              
                                                                               
                                                                          
  
                                                            
                                                                               
                                                                                 
                                                    
                                                                            
                                                                              
                                                                                   
                                                                    
                                                                             
                                                                             
  
                                                                                
                                                                             
                                                                                 
                                                                                
                                                                           
                                                                                 
                                                                     
  
                                                                                
                                                               
   

export type DrawMode = 'pen' | 'highlighter'

                                                                                
                                                                                    
export const HIGHLIGHTER_OPACITY = 0.4

export interface DrawStyleInput {
  points: readonly (readonly [number, number])[]
                                                                 
  pressures?: readonly number[]
                                                                           
  size: number
  mode?: DrawMode
                                                                                       
  thinning?: number
                                                                                   
  taper?: number
                                                                                 
  streamline?: number
                                                                      
  last?: boolean
}

                                                                               

type V = [number, number]

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]]
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]]
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s]
const neg = (a: V): V => [-a[0], -a[1]]
const per = (a: V): V => [a[1], -a[0]]                           
const dpr = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1]
const len = (a: V): number => Math.hypot(a[0], a[1])
const len2 = (a: V): number => a[0] * a[0] + a[1] * a[1]
const dist2 = (a: V, b: V): number => len2(sub(a, b))
const dist = (a: V, b: V): number => Math.hypot(a[1] - b[1], a[0] - b[0])
const uni = (a: V): V => { const l = len(a); return l === 0 ? [0, 0] : [a[0] / l, a[1] / l] }
const lrp = (a: V, b: V, t: number): V => add(a, mul(sub(b, a), t))
const prj = (a: V, b: V, c: number): V => add(a, mul(b, c))           
const isEqual = (a: V, b: V): boolean => a[0] === b[0] && a[1] === b[1]
const rotAround = (a: V, c: V, r: number): V => {
  const s = Math.sin(r)
  const co = Math.cos(r)
  const px = a[0] - c[0]
  const py = a[1] - c[1]
  return [px * co - py * s + c[0], px * s + py * co + c[1]]
}

const RATE_OF_PRESSURE_CHANGE = 0.275
const PI = Math.PI

interface StrokePoint {
  point: V
  pressure: number
  vector: V
  distance: number
  runningLength: number
}

                                                                               

const getStrokePoints = (
  pts: readonly (readonly [number, number])[],
  pressures: readonly number[] | undefined,
  size: number,
  streamline: number,
  last: boolean,):StrokePoint[] => {
  const t = 0.15 + (1 - streamline) * 0.85
  if (pts.length === 0) return []

  const src: V[] = pts.map((p) => [p[0], p[1]])
  const press: number[] = pts.map((_, i) => {
    const v = pressures?.[i]
    return v === undefined || v <= 0 ? 0.5 : v
  })

                                                                           
  if (src.length === 1) {
    src.push([src[0][0] + 1, src[0][1] + 1])
    press.push(press[0])
  }

  const result: StrokePoint[] = [
    { point: src[0], pressure: press[0], vector: [1, 1], distance: 0, runningLength: 0 },
  ]

  let hasReachedMinimumLength = false
  let runningLength = 0
  let prev = result[0]
  const max = src.length - 1

  for (let i = 1; i < src.length; i++) {
    const point = last && i === max ? src[i] : lrp(prev.point, src[i], t)
    if (isEqual(prev.point, point)) continue
    const d = dist(point, prev.point)
    runningLength += d
    if (i < max && !hasReachedMinimumLength) {
      if (runningLength < size) continue
      hasReachedMinimumLength = true
    }
    prev = {
      point,
      pressure: press[i],
      vector: uni(sub(prev.point, point)),
      distance: d,
      runningLength,
    }
    result.push(prev)
  }

  if (result.length > 1) result[0].vector = result[1].vector
  return result
};

                                                                               

const getStrokeOutlinePoints = (
  points: StrokePoint[],
  size: number,
  thinning: number,
  smoothing: number,
  simulatePressure: boolean,
  taperStart: number,
  taperEnd: number,
  last: boolean,):V[] => {
  const easing = (n: number) => n                          
  const capStartEase = (t: number) => t * (2 - t)
  const capEndEase = (t: number) => { const u = t - 1; return u * u * u + 1 }

  if (points.length === 0) return []

  const totalLength = points[points.length - 1].runningLength
  const minDistance = (size * smoothing) ** 2
  const leftPts: V[] = []
  const rightPts: V[] = []

  const radiusFor = (pressure: number) =>
    thinning
      ? size * easing(0.5 - thinning * (0.5 - pressure))
      : size / 2

  let prevPressure = points[0].pressure
                                                                            
  for (let i = 0; i < Math.min(points.length, 10); i++) {
    const pressure = points[i].pressure
    if (simulatePressure) {
      const sp = Math.min(1, points[i].distance / size)
      const rp = Math.min(1, 1 - sp)
      prevPressure = Math.min(1, prevPressure + (rp - prevPressure) * (sp * RATE_OF_PRESSURE_CHANGE))
    } else {
      prevPressure = Math.min(1, prevPressure + (pressure - prevPressure) * 0.5)
    }
  }

  let radius = radiusFor(Math.max(...points.map((p) => p.pressure)))
  let prevVector = points[0].vector
  let pl = points[0].point
  let pr = points[0].point
  let tl = pl
  let tr = pr
  let isPrevPointSharpCorner = false

  for (let i = 0; i < points.length; i++) {
    let { pressure } = points[i]
    const { point, vector, distance, runningLength } = points[i]

                                                                
    if (i < points.length - 1 && totalLength - runningLength < 3) continue

    if (thinning) {
      if (simulatePressure) {
        const sp = Math.min(1, distance / size)
        const rp = Math.min(1, 1 - sp)
        pressure = Math.min(1, prevPressure + (rp - prevPressure) * (sp * RATE_OF_PRESSURE_CHANGE))
      }
      radius = radiusFor(pressure)
    } else {
      radius = size / 2
    }

                                                             
    const ts = runningLength < taperStart ? capStartEase(runningLength / taperStart) : 1
    const te = totalLength - runningLength < taperEnd ? capEndEase((totalLength - runningLength) / taperEnd) : 1
    radius = Math.max(0.01, radius * Math.min(ts, te))

    const nextVector = (i < points.length - 1 ? points[i + 1] : points[i]).vector
    const nextDpr = i < points.length - 1 ? dpr(vector, nextVector) : 1
    const prevDpr = dpr(vector, prevVector)
    const isPointSharpCorner = prevDpr < 0 && !isPrevPointSharpCorner
    const isNextPointSharpCorner = nextDpr < 0

    if (isPointSharpCorner || isNextPointSharpCorner) {
                                                                        
      const offset = mul(per(prevVector), radius)
      for (let step = 1 / 13, s = 0; s <= 1; s += step) {
        tl = rotAround(sub(point, offset), point, PI * s)
        leftPts.push(tl)
        tr = rotAround(add(point, offset), point, PI * -s)
        rightPts.push(tr)
      }
      pl = tl
      pr = tr
      if (isNextPointSharpCorner) isPrevPointSharpCorner = true
      continue
    }

    isPrevPointSharpCorner = false

    if (i === points.length - 1) {
      const offset = mul(per(vector), radius)
      leftPts.push(sub(point, offset))
      rightPts.push(add(point, offset))
      continue
    }

                                                                             
    const offset = mul(per(lrp(nextVector, vector, nextDpr)), radius)
    tl = sub(point, offset)
    if (i <= 1 || dist2(pl, tl) > minDistance) {
      leftPts.push(tl)
      pl = tl
    }
    tr = add(point, offset)
    if (i <= 1 || dist2(pr, tr) > minDistance) {
      rightPts.push(tr)
      pr = tr
    }

    prevPressure = pressure
    prevVector = vector
  }

  const firstPoint = points[0].point
  const lastPoint = points.length > 1 ? points[points.length - 1].point : add(points[0].point, [1, 1])
  const startCap: V[] = []
  const endCap: V[] = []

                                       
  if (points.length === 1 && !(taperStart || taperEnd)) {
    const start = prj(firstPoint, uni(per(sub(firstPoint, lastPoint))), -radius)
    const dot: V[] = []
    for (let step = 1 / 13, t = step; t <= 1; t += step) {
      dot.push(rotAround(start, firstPoint, PI * 2 * t))
    }
    return dot
  }

               
  if (taperStart) {
    startCap.push(firstPoint)
  } else {
    const first = leftPts[0] ?? firstPoint
    for (let step = 1 / 13, t = step; t <= 1; t += step) {
      startCap.push(rotAround(rightPts[0] ?? first, firstPoint, PI * t))
    }
  }

             
  const direction = per(neg(points[points.length - 1].vector))
  if (taperEnd || !last) {
    endCap.push(lastPoint)
  } else {
    const start = prj(lastPoint, direction, radius)
    for (let step = 1 / 29, t = step; t < 1; t += step) {
      endCap.push(rotAround(start, lastPoint, PI * 3 * t))
    }
  }

  return leftPts.concat(endCap, rightPts.reverse(), startCap)
};

                                                                               

const avg = (a: number, b: number) => (a + b) / 2
const f2 = (n: number) => Math.round(n * 100) / 100

const getSvgPathFromStroke = (points: V[]):string => {
  const l = points.length
  if (l < 4) {
    if (l === 0) return ''
                                                                    
    const [x, y] = points[0]
    return `M ${f2(x)} ${f2(y)} l 0.01 0 Z`
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]
  let d = `M ${f2(a[0])} ${f2(a[1])} Q ${f2(b[0])} ${f2(b[1])} ${f2(avg(b[0], c[0]))} ${f2(avg(b[1], c[1]))} T`

  for (let i = 2, max = l - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    d += ` ${f2(avg(a[0], b[0]))} ${f2(avg(a[1], b[1]))}`
  }

  d += ' Z'
  return d
};

// --- Public API -------------------------------------------------------------

/**
 * Turn raw pointer samples into a filled outline `d` string for the given mode.
 * Deterministic: same input → same path in preview, editor scene, and export.
 */
export const getDrawPath = (input: DrawStyleInput):string => {
  const { points, pressures, size, mode = 'pen', last = true } = input
  if (points.length === 0) return ''

  const isHighlighter = mode === 'highlighter'
  const thinning = input.thinning ?? (isHighlighter ? 0 : 0.55)
  const streamline = input.streamline ?? (isHighlighter ? 0.4 : 0.5)
  const smoothing = 0.5
  // Taper is a 0..1 fraction of the natural end taper (capped at 20 design units
  // or the stroke width, whichever is smaller). 0 → round caps (a blunt marker
  // end), 1 → a fine point. Highlighter defaults to no taper (round marker).
  const taperAmt = input.taper ?? (isHighlighter ? 0 : 1)
  const taperLen = taperAmt * Math.min(size, 20)
  const taperStart = taperLen
  const taperEnd = taperLen
  // Simulate pressure from velocity unless real pen pressure was captured.
  const hasRealPressure = !!pressures && pressures.some((p) => p > 0 && p !== 0.5)
  const simulatePressure = !hasRealPressure

  const strokePoints = getStrokePoints(points, pressures, size, streamline, last)
  const outline = getStrokeOutlinePoints(
    strokePoints,
    size,
    thinning,
    smoothing,
    simulatePressure,
    taperStart,
    taperEnd,
    last,
  )
  return getSvgPathFromStroke(outline)
};
