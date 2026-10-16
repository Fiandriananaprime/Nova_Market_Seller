                                                         
export const trianglePoints = (w: number, h: number):[number, number][] => {
  return [[w / 2, 0], [w, h], [0, h]]
};

                                                                                      
export const starPoints = (w: number, h: number, points = 5, innerRatio = 0.42):[number, number][] => {
  const cx = w / 2
  const cy = h / 2
  const out: [number, number][] = []
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / points
    const f = i % 2 === 0 ? 1 : innerRatio
    out.push([cx + cx * f * Math.cos(angle), cy + cy * f * Math.sin(angle)])
  }
  return out
};

                                                                                   
export const arrowHeadPoints = (tipX: number, tipY: number, dirX: number, dirY: number, size: number):[number, number][] => {
  const len = Math.hypot(dirX, dirY) || 1
  const ux = dirX / len
  const uy = dirY / len
  const px = -uy                 
  const py = ux
  const bx = tipX - ux * size
  const by = tipY - uy * size
  return [
    [tipX, tipY],
    [bx + px * size * 0.55, by + py * size * 0.55],
    [bx - px * size * 0.55, by - py * size * 0.55],
  ]
};

                                                                
export const toPointsAttr = (pts: readonly (readonly [number, number])[]):string => {
  return pts.map(([x, y]) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(' ')
};

/** Shortest distance from a point to a polyline (min over each segment). Used to
 *  hit-test and erase freehand strokes against the actual ink, not their bbox. */
export const distToPolyline = (px: number, py: number, pts: readonly (readonly [number, number])[]):number => {
  if (pts.length === 0) return Infinity
  if (pts.length === 1) return Math.hypot(px - pts[0][0], py - pts[0][1])
  let min = Infinity
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]
    const [x2, y2] = pts[i]
    const dx = x2 - x1
    const dy = y2 - y1
    const l2 = dx * dx + dy * dy
    const t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0
    const d = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
    if (d < min) min = d
  }
  return min
};
