import { useRef, useState, useCallback } from 'react'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { useUIStore } from '@/features/product-studio/canvas/store/useUIStore'
import { distToPolyline } from '@/features/product-studio/canvas/lib/geometry'
import type { DrawLayer, DrawMode } from '@/features/product-studio/canvas/types/design'

   
                                                                                
                                                                                 
                                                                                
                                                                      
                            
  
                                                                               
                                                                                 
                                                                             
                                                                          
  
                                                                               
                                                                          
   
export const useDrawTool = (wrapRef: React.RefObject<HTMLDivElement | null>, zoom: number) => {
  const drawingRef = useRef(false)
  const erasingRef = useRef(false)
  const ptsRef = useRef<[number, number][]>([])
  const pressRef = useRef<number[]>([])
  const straightRef = useRef(false)                                               
  const [preview, setPreview] = useState<[number, number][]>([])
  const [previewPress, setPreviewPress] = useState<number[]>([])

                                                                                   
  const mode = useUIStore((s) => s.drawMode)
  const strokeWidth = useUIStore((s) => (s.drawMode === 'highlighter' ? s.highlighterWidth : s.drawWidth))
  const color = useUIStore((s) => (s.drawMode === 'highlighter' ? s.highlighterColor : s.drawColor))
                                                                               
  const thinning = useUIStore((s) => s.drawThinning)
  const taper = useUIStore((s) => s.drawTaper)
  const streamline = useUIStore((s) => s.drawSmoothing)
  const opacity = useUIStore((s) => s.drawOpacity)

  const localPoint = useCallback((e: React.PointerEvent): [number, number] => {
    const rect = wrapRef.current!.getBoundingClientRect()
    return [(e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom]
  }, [wrapRef, zoom])

                                                                             
  const pressureOf = (e: React.PointerEvent): number =>
    e.pointerType === 'mouse' ? 0.5 : (e.pressure > 0 ? e.pressure : 0.5)

                                                                             
                                                                     
  const strokeFor = useCallback((): { pts: [number, number][]; press: number[] } => {
    const p = ptsRef.current
    const pr = pressRef.current
    if (straightRef.current && p.length >= 2) {
      return { pts: [p[0], p[p.length - 1]], press: [pr[0], pr[pr.length - 1]] }
    }
    return { pts: p, press: pr }
  }, [])

                                                                             
  const eraseAt = useCallback((x: number, y: number) => {
    const d = useDesignStore.getState()
    const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
    const slop = (coarse ? 24 : 16) / (zoom || 1)
    const remove: string[] = []
    for (const layer of d.document.layers) {
      if (layer.type !== 'draw' || !layer.visible || layer.locked) continue
      const sx = layer.natWidth ? layer.width / layer.natWidth : 1
      const sy = layer.natHeight ? layer.height / layer.natHeight : 1
      const avg = (Math.abs(sx) + Math.abs(sy)) / 2 || 1
      const lx = (x - layer.x) / (sx || 1)
      const ly = (y - layer.y) / (sy || 1)
      if (distToPolyline(lx, ly, layer.points) <= (layer.strokeWidth ?? 4) / 2 + slop / avg) remove.push(layer.id)
    }
    if (remove.length) d.removeLayers(remove)
  }, [zoom])

  const onPointerDown = useCallback((e: React.PointerEvent): boolean => {
    const tool = useDesignStore.getState().tool
    if (tool === 'eraser') {
      e.preventDefault()
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId)
      } catch (error) {
        console.error('Unable to capture pointer for erasing:', error)
      }
      erasingRef.current = true
      useDesignStore.getState().pushSnapshot()                                        
      const [x, y] = localPoint(e)
      eraseAt(x, y)
      return true
    }
    if (tool !== 'draw') return false
    e.preventDefault()
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId)
    } catch (error) {
      console.error('Unable to capture pointer for drawing:', error)
    }
    drawingRef.current = true
    straightRef.current = e.shiftKey
    ptsRef.current = [localPoint(e)]
    pressRef.current = [pressureOf(e)]
    setPreview([...ptsRef.current])
    setPreviewPress([...pressRef.current])
    return true
  }, [localPoint, eraseAt])

  const onPointerMove = useCallback((e: React.PointerEvent): boolean => {
    if (erasingRef.current) { const [x, y] = localPoint(e); eraseAt(x, y); return true }
    if (!drawingRef.current) return false
                                                                                 
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function'
      ? e.nativeEvent.getCoalescedEvents()
      : [e.nativeEvent]
    const rect = wrapRef.current!.getBoundingClientRect()
    for (const ev of events) {
      ptsRef.current.push([(ev.clientX - rect.left) / zoom, (ev.clientY - rect.top) / zoom])
      pressRef.current.push(ev.pointerType === 'mouse' ? 0.5 : (ev.pressure > 0 ? ev.pressure : 0.5))
    }
    straightRef.current = e.shiftKey
    const s = strokeFor()
    setPreview([...s.pts])
    setPreviewPress([...s.press])
    return true
  }, [wrapRef, zoom, localPoint, eraseAt, strokeFor])

  const onPointerUp = useCallback((): boolean => {
    if (erasingRef.current) { erasingRef.current = false; return true }
    if (!drawingRef.current) return false
    drawingRef.current = false
    const s = strokeFor()
    const pts = s.pts
    const press = s.press
    ptsRef.current = []
    pressRef.current = []
    setPreview([])
    setPreviewPress([])
    if (pts.length < 2) return true                     

    const ui = useUIStore.getState()
    const drawMode: DrawMode = ui.drawMode
    const drawColor = drawMode === 'highlighter' ? ui.highlighterColor : ui.drawColor
    const drawWidth = drawMode === 'highlighter' ? ui.highlighterWidth : ui.drawWidth

    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    const pad = drawWidth / 2                                               
    const rel = pts.map(([x, y]) => [x - minX + pad, y - minY + pad] as [number, number])

    const w = maxX - minX + drawWidth
    const h = maxY - minY + drawWidth
    const d = useDesignStore.getState()
    d.pushSnapshot()
    d.addLayer({
      type: 'draw',
      name: drawMode === 'highlighter' ? 'Highlight' : 'Drawing',
      visible: true,
      locked: false,
      opacity: drawMode === 'pen' ? ui.drawOpacity : 1,
      x: minX - pad,
      y: minY - pad,
      width: w,
      height: h,
      rotation: 0,
      points: rel,
      pressures: press,
      color: drawColor,
      strokeWidth: drawWidth,
      mode: drawMode,
                                                                               
                                                                                   
      ...(drawMode === 'pen'
        ? { thinning: ui.drawThinning, taper: ui.drawTaper, streamline: ui.drawSmoothing }
        : {}),
      natWidth: w,
      natHeight: h,
    } as Omit<DrawLayer, 'id' | 'zIndex'>)
    return true
  }, [strokeFor])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    preview,
    previewPress,
    mode,
    strokeWidth,
    color,
    thinning,
    taper,
    streamline,
    opacity,
    drawing: preview.length > 0,
  }
};
