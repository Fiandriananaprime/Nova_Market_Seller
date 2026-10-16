import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDesignStore, createTextLayer } from '@/features/product-studio/canvas/store/useDesignStore'
import { relayoutActiveFrame } from '@/features/product-studio/canvas/store/useAIStore'
import { AI_ENABLED } from '@/features/product-studio/canvas/lib/aiApi'
import { getBrandColor } from '@/features/product-studio/canvas/brand/palette'
import { useContextMenuStore, type ContextMenuItem } from '@/features/product-studio/canvas/store/useContextMenuStore'
import type { Layer } from '@/features/product-studio/canvas/types/design'
import { useWorkspaceStore } from '@/features/product-studio/canvas/store/useWorkspaceStore'
import { DesignSvgScene } from '@/features/product-studio/canvas/components/canvas/DesignSvgScene'
import { FloatingToolbar } from '@/features/product-studio/canvas/components/layout/FloatingToolbar'
import { DrawQuickBar } from '@/features/product-studio/canvas/components/layout/DrawQuickBar'
import { useCoarsePointer } from '@/features/product-studio/canvas/hooks/useCoarsePointer'
import { FrameThumbnail } from '@/features/product-studio/canvas/components/canvas/FrameThumbnail'
import { ShaderBackgroundOverlay } from '@/features/product-studio/canvas/components/canvas/ShaderBackground'
import { GridOverlay } from '@/features/product-studio/canvas/components/canvas/GridOverlay'
import { SelectionOverlay } from '@/features/product-studio/canvas/components/canvas/SelectionOverlay'
import { HoverOverlay } from '@/features/product-studio/canvas/components/canvas/HoverOverlay'
import { AutoLayoutOverlay } from '@/features/product-studio/canvas/components/canvas/AutoLayoutOverlay'
import { DistanceMeasurement } from '@/features/product-studio/canvas/components/canvas/DistanceMeasurement'
import { TextEditOverlay } from '@/features/product-studio/canvas/components/canvas/TextEditOverlay'
import { useCanvasInteraction } from '@/features/product-studio/canvas/hooks/useCanvasInteraction'
import { useDrawTool } from '@/features/product-studio/canvas/hooks/useDrawTool'
import { getDrawPath, HIGHLIGHTER_OPACITY } from '@/features/product-studio/canvas/engine/freehand'
import { Minus, Plus, Maximize, Grid3X3, Copy, Trash2, Pencil, Type, Square, ArrowUp, ArrowDown, Eye, EyeOff, Lock, Unlock, Sparkles, Loader2, X } from 'lucide-react'
import { useUIStore, GRID_PRESETS, resolveGrid } from '@/features/product-studio/canvas/store/useUIStore'
import type { Frame } from '@/features/product-studio/canvas/types/workspace'

const DRAG_THRESHOLD = 3                                                        

                                                                             
                                                                            
                                                                 
const RevealWords = ({ text, baseDelay = 0, stagger = 0.045 }: { text: string; baseDelay?: number; stagger?: number }) => {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: '0.5em', filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: baseDelay + i * stagger, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </>
  )
};

                                                                              
                                                                              
                                                                                
                                                                               
const ReformatNudge = () => {
  const format = useDesignStore((s) => s.document.format)
  const contentCount = useDesignStore((s) =>
    s.document.layers.reduce((n, l) => (l.type === 'background' ? n : n + 1), 0),
  )
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const prevId = useRef(format.id)

  useEffect(() => {
                                                                                  
    if (prevId.current === format.id) return
    prevId.current = format.id
    if (contentCount === 0) return
                                                                                
    if (!AI_ENABLED) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(t)
  }, [format.id, contentCount])

  const runRelayout = async () => {
    setBusy(true)
    try {
      await relayoutActiveFrame()
    } finally {
      setBusy(false)
      setVisible(false)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-white/95 px-4 py-2 shadow-lg backdrop-blur"
        >
          <span className="text-[13px] text-muted-foreground">
            Reformatted to <span className="font-medium text-foreground">{format.label}</span>
          </span>
          <button
            type="button"
            onClick={runRelayout}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[13px] font-medium text-primary-foreground transition-transform active:scale-[0.96] disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {busy ? 'Re-laying out…' : 'Re-layout with AI'}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
};

export const PreviewPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeWrapRef = useRef<HTMLDivElement>(null)

                                                                
  const docFormat = useDesignStore((s) => s.document.format)
  const zoom = useDesignStore((s) => s.zoom)
  const panOffset = useDesignStore((s) => s.panOffset)
  const setZoom = useDesignStore((s) => s.setZoom)
  const setPanOffset = useDesignStore((s) => s.setPanOffset)
  const tool = useDesignStore((s) => s.tool)
                                                                                  
                                                                
  const contentLayerCount = useDesignStore((s) =>
    s.document.layers.reduce((n, l) => (l.type === 'background' ? n : n + 1), 0),
  )

                                                                       
  const workspace = useWorkspaceStore((s) => s.workspace)
  const activeFrameId = useWorkspaceStore((s) => s.activeFrameId)
  const setActiveFrame = useWorkspaceStore((s) => s.setActiveFrame)
  const updateFrame = useWorkspaceStore((s) => s.updateFrame)
  const duplicateFrame = useWorkspaceStore((s) => s.duplicateFrame)
  const removeFrame = useWorkspaceStore((s) => s.removeFrame)
  const openMenu = useContextMenuStore((s) => s.openMenu)
  const selectedFrameIds = useWorkspaceStore((s) => s.selectedFrameIds)
  const setSelectedFrames = useWorkspaceStore((s) => s.setSelectedFrames)

  const showGrid = useUIStore((s) => s.showGrid)
  const toggleGrid = useUIStore((s) => s.toggleGrid)
  const gridPreset = useUIStore((s) => s.gridPreset)
  const gridConfig = useUIStore((s) => s.gridConfig)
  const setGridPreset = useUIStore((s) => s.setGridPreset)
  const [gridMenuOpen, setGridMenuOpen] = useState(false)

                                                        
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const commitFrameRename = () => {
    if (editingFrameId) {
      const name = editingName.trim()
      if (name) updateFrame(editingFrameId, { name })
    }
    setEditingFrameId(null)
  }

  const activePage = workspace.pages.find((p) => p.id === workspace.activePageId)
  const frames = useMemo(() => activePage?.frames ?? [], [activePage?.frames])
  const hasFrames = frames.length > 0
  const showLabels = workspace.showFrameLabels !== false
  const activeFrame = frames.find((f) => f.id === activeFrameId) ?? null

  const {
    snapGuides, spacingGuides, hoverCursor, marqueeRect,
    handlePointerDown, handlePointerMove, handlePointerUp,
    handleResizeStart, handleGroupResizeStart, handleDoubleClick,
  } = useCanvasInteraction()

                                                                               
                                                                    
  const drawTool = useDrawTool(activeWrapRef, zoom)

                                                                                 
                                                                      
  useEffect(() => {
    if (hasFrames && !frames.some((f) => f.id === activeFrameId)) {
      setActiveFrame(frames[0].id)
    }
  }, [hasFrames, frames, activeFrameId, setActiveFrame])

                                                                             
                                                                            
                                                               
  const viewTweenRef = useRef<number>(0)
  const tweenView = useCallback((targetZoom: number, targetPan: { x: number; y: number }) => {
    cancelAnimationFrame(viewTweenRef.current)
    const z0 = useDesignStore.getState().zoom
    const p0 = useDesignStore.getState().panOffset
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setZoom(targetZoom); setPanOffset(targetPan); return
    }
    const duration = 420
    const start = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)                
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const k = ease(t)
      setZoom(z0 + (targetZoom - z0) * k)
      setPanOffset({ x: p0.x + (targetPan.x - p0.x) * k, y: p0.y + (targetPan.y - p0.y) * k })
      if (t < 1) viewTweenRef.current = requestAnimationFrame(step)
    }
    viewTweenRef.current = requestAnimationFrame(step)
  }, [setZoom, setPanOffset])

  useEffect(() => () => cancelAnimationFrame(viewTweenRef.current), [])

                                                                               
                                                                           
  const fitToFrames = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const pageFrames = useWorkspaceStore.getState().getActivePage()?.frames ?? []
    if (pageFrames.length === 0) return
    const minX = Math.min(...pageFrames.map((f) => f.x))
    const minY = Math.min(...pageFrames.map((f) => f.y))
    const maxX = Math.max(...pageFrames.map((f) => f.x + f.width))
    const maxY = Math.max(...pageFrames.map((f) => f.y + f.height))
    const bboxW = Math.max(1, maxX - minX)
    const bboxH = Math.max(1, maxY - minY)
    const rect = el.getBoundingClientRect()
    const pad = 64
    const z = Math.max(0.05, Math.min(1, Math.min((rect.width - pad * 2) / bboxW, (rect.height - pad * 2) / bboxH)))
    tweenView(z, { x: -((minX + maxX) / 2) * z, y: -((minY + maxY) / 2) * z })
  }, [tweenView])

                                                                              
                                                                             
  const prevFrameCount = useRef(-1)
  useEffect(() => {
    if (!hasFrames) { prevFrameCount.current = frames.length; return }
    if (prevFrameCount.current === -1 || frames.length > prevFrameCount.current) {
      fitToFrames()
    }
    prevFrameCount.current = frames.length
  }, [frames.length, hasFrames, fitToFrames])

                                                                                 
                                                                          
                                                                                
                                                                             
                                                                             
  const didInitialFit = useRef(false)
  useEffect(() => {
    const el = containerRef.current
    if (!el || didInitialFit.current) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      const hasContent = (useWorkspaceStore.getState().getActivePage()?.frames?.length ?? 0) > 0
      if (r.width > 0 && r.height > 0 && hasContent && !didInitialFit.current) {
        didInitialFit.current = true
        fitToFrames()
        ro.disconnect()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitToFrames])

                                                                              
                                                                                
                                                                                    
                                                                                        
  const zoomAtPoint = useCallback((nextZoom: number, clientX: number, clientY: number) => {
    const el = containerRef.current
    const z0 = useDesignStore.getState().zoom
    const z1 = Math.max(0.1, Math.min(4, nextZoom))
    if (!el || z1 === z0) { if (z1 !== z0) setZoom(z1); return }
    const rect = el.getBoundingClientRect()
    const pan = useDesignStore.getState().panOffset
    const sx = clientX - (rect.left + rect.width / 2)
    const sy = clientY - (rect.top + rect.height / 2)
    const k = z1 / z0
    setPanOffset({ x: sx - (sx - pan.x) * k, y: sy - (sy - pan.y) * k })
    setZoom(z1)
  }, [setZoom, setPanOffset])

  const zoomToCentre = useCallback((nextZoom: number) => {
    const el = containerRef.current
    if (!el) { setZoom(nextZoom); return }
    const rect = el.getBoundingClientRect()
    zoomAtPoint(nextZoom, rect.left + rect.width / 2, rect.top + rect.height / 2)
  }, [zoomAtPoint, setZoom])

                                                                                
                                                                       
  const fitToSelection = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const d = useDesignStore.getState()
    const sel = d.selectedLayerIds
    const chosen = d.document.layers.filter((l) => sel.has(l.id))
    if (chosen.length === 0) { fitToFrames(); return }
    const af = useWorkspaceStore.getState().getActiveFrame()
    const ox = af?.x ?? 0
    const oy = af?.y ?? 0
    const minX = Math.min(...chosen.map((l) => ox + l.x))
    const minY = Math.min(...chosen.map((l) => oy + l.y))
    const maxX = Math.max(...chosen.map((l) => ox + l.x + l.width))
    const maxY = Math.max(...chosen.map((l) => oy + l.y + l.height))
    const bboxW = Math.max(1, maxX - minX)
    const bboxH = Math.max(1, maxY - minY)
    const rect = el.getBoundingClientRect()
    const pad = 80
    const z = Math.max(0.05, Math.min(4, Math.min((rect.width - pad * 2) / bboxW, (rect.height - pad * 2) / bboxH)))
    tweenView(z, { x: -((minX + maxX) / 2) * z, y: -((minY + maxY) / 2) * z })
  }, [tweenView, fitToFrames])

                                                                                      
  useEffect(() => {
    const onZoom = (e: Event) => {
      const action = (e as CustomEvent).detail?.action
      const z = useDesignStore.getState().zoom
      if (action === 'in') zoomToCentre(Math.min(4, z * 1.2))
      else if (action === 'out') zoomToCentre(Math.max(0.05, z / 1.2))
      else if (action === 'reset') { setZoom(1); setPanOffset({ x: 0, y: 0 }) }
      else if (action === 'fit') fitToFrames()
      else if (action === 'selection') fitToSelection()
    }
    window.addEventListener('canvas-zoom', onZoom)
    return () => window.removeEventListener('canvas-zoom', onZoom)
  }, [zoomToCentre, fitToFrames, fitToSelection, setZoom, setPanOffset])

                                                                              
                                                                                
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey) {
        const z = useDesignStore.getState().zoom
        zoomAtPoint(z * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY)
      } else {
        const p = useDesignStore.getState().panOffset
        useDesignStore.getState().setPanOffset({ x: p.x - e.deltaX, y: p.y - e.deltaY })
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [zoomAtPoint])

                                                                            
                                                                                 
                                                                              
                                                                               
                                                                                      
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let pinch: { lastDist: number; lastMidX: number; lastMidY: number } | null = null
    let pan: { startX: number; startY: number; panX: number; panY: number; moved: boolean } | null = null
    const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    const midX = (a: Touch, b: Touch) => (a.clientX + b.clientX) / 2
    const midY = (a: Touch, b: Touch) => (a.clientY + b.clientY) / 2

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pan = null
        const [a, b] = [e.touches[0], e.touches[1]]
        pinch = { lastDist: dist(a, b), lastMidX: midX(a, b), lastMidY: midY(a, b) }
        e.preventDefault()
        return
      }
                                                                                 
                                                                             
                                                      
      if (e.touches.length === 1 && e.target === el) {
        const p = useDesignStore.getState().panOffset
        const t = e.touches[0]
        pan = { startX: t.clientX, startY: t.clientY, panX: p.x, panY: p.y, moved: false }
      }
    }
    const onMove = (e: TouchEvent) => {
      if (pinch && e.touches.length >= 2) {
        e.preventDefault()
        const [a, b] = [e.touches[0], e.touches[1]]
        const d = dist(a, b)
        const mx = midX(a, b)
        const my = midY(a, b)
        if (pinch.lastDist > 0) {
          const z = useDesignStore.getState().zoom
          zoomAtPoint(z * (d / pinch.lastDist), mx, my)
        }
        const p = useDesignStore.getState().panOffset
        useDesignStore.getState().setPanOffset({ x: p.x + (mx - pinch.lastMidX), y: p.y + (my - pinch.lastMidY) })
        pinch.lastDist = d
        pinch.lastMidX = mx
        pinch.lastMidY = my
        return
      }
      if (pan && e.touches.length === 1) {
        const t = e.touches[0]
        const dx = t.clientX - pan.startX
        const dy = t.clientY - pan.startY
        if (!pan.moved && Math.hypot(dx, dy) < 6) return
        pan.moved = true
        e.preventDefault()
        useDesignStore.getState().setPanOffset({ x: pan.panX + dx, y: pan.panY + dy })
      }
    }
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null
      if (e.touches.length === 0) {
        if (pan && !pan.moved) {
          useDesignStore.getState().deselectAll()
          useWorkspaceStore.getState().setSelectedFrames([])
        }
        pan = null
      }
    }

    el.addEventListener('touchstart', onStart, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [zoomAtPoint])

                                                                                       
  const frameDrag = useRef<{
    startClientX: number; startClientY: number; moved: boolean; starts: { id: string; x: number; y: number; w: number; h: number }[]
  } | null>(null)

  const onFrameDragMove = useCallback((e: PointerEvent) => {
    const d = frameDrag.current
    if (!d) return
    if (Math.abs(e.clientX - d.startClientX) > DRAG_THRESHOLD || Math.abs(e.clientY - d.startClientY) > DRAG_THRESHOLD) {
      d.moved = true
    }
    if (!d.moved) return
    const z = useDesignStore.getState().zoom
    let dx = (e.clientX - d.startClientX) / z
    let dy = (e.clientY - d.startClientY) / z

                                                                                 
                                                                              
                                                                                  
    const primary = d.starts[0]
    if (primary) {
      const draggedIds = new Set(d.starts.map((s) => s.id))
      const others = (useWorkspaceStore.getState().getActivePage()?.frames ?? []).filter((f) => !draggedIds.has(f.id))
      const TH = 8 / z
      const px = primary.x + dx
      const py = primary.y + dy
      const ptsX = [px, px + primary.w / 2, px + primary.w]
      const ptsY = [py, py + primary.h / 2, py + primary.h]
      const tX: number[] = []
      const tY: number[] = []
      for (const f of others) {
        tX.push(f.x, f.x + f.width / 2, f.x + f.width)
        tY.push(f.y, f.y + f.height / 2, f.y + f.height)
      }
      let bestDx = TH + 1
      let corrX = 0
      let bestDy = TH + 1
      let corrY = 0
      for (const p of ptsX) for (const t of tX) { const dd = Math.abs(p - t); if (dd < bestDx) { bestDx = dd; corrX = t - p } }
      for (const p of ptsY) for (const t of tY) { const dd = Math.abs(p - t); if (dd < bestDy) { bestDy = dd; corrY = t - p } }
      if (bestDx <= TH) dx += corrX
      if (bestDy <= TH) dy += corrY
    }

    for (const s of d.starts) {
      updateFrame(s.id, { x: Math.round(s.x + dx), y: Math.round(s.y + dy) })
    }
  }, [updateFrame])

  const onFrameDragUp = useCallback(() => {
    frameDrag.current = null
    window.removeEventListener('pointermove', onFrameDragMove)
  }, [onFrameDragMove])

                                                                                
                                                                      
  const pickFrame = useCallback((e: React.PointerEvent, frame: Frame) => {
    e.stopPropagation()
                                                                              
                                                                 
    useDesignStore.getState().deselectAll()
    const selected = useWorkspaceStore.getState().selectedFrameIds
    if (e.shiftKey) {
      const next = new Set(selected)
      if (next.has(frame.id)) next.delete(frame.id)
      else next.add(frame.id)
      setSelectedFrames([...next])
      if (!selected.has(frame.id)) setActiveFrame(frame.id)
    } else {
      setActiveFrame(frame.id)
      setSelectedFrames([frame.id])
    }
  }, [setActiveFrame, setSelectedFrames])

  const startFrameDrag = useCallback((e: React.PointerEvent, frame: Frame) => {
    if (e.shiftKey) { pickFrame(e, frame); return }
    e.stopPropagation()
    useDesignStore.getState().deselectAll()
    setActiveFrame(frame.id)

                                                                                    
                                                              
    const selected = useWorkspaceStore.getState().selectedFrameIds
    const pageFrames = useWorkspaceStore.getState().getActivePage()?.frames ?? []
                                                                                  
                                 
    const group = selected.has(frame.id) && selected.size > 1
      ? [frame, ...pageFrames.filter((f) => selected.has(f.id) && f.id !== frame.id)]
      : [frame]
    if (!(selected.has(frame.id) && selected.size > 1)) setSelectedFrames([frame.id])

    frameDrag.current = {
      startClientX: e.clientX, startClientY: e.clientY, moved: false,
      starts: group.map((f) => ({ id: f.id, x: f.x, y: f.y, w: f.width, h: f.height })),
    }
    window.addEventListener('pointermove', onFrameDragMove)
    window.addEventListener('pointerup', onFrameDragUp, { once: true })
  }, [pickFrame, setActiveFrame, setSelectedFrames, onFrameDragMove, onFrameDragUp])

                                                                      
  const marqueeStart = useRef<{ clientX: number; clientY: number } | null>(null)
  const [marqueeRectScreen, setMarqueeRectScreen] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  const selectFramesInMarquee = useCallback((aX: number, aY: number, bX: number, bY: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const z = useDesignStore.getState().zoom
    const pan = useDesignStore.getState().panOffset
                                                                                 
    const originX = rect.left + rect.width / 2 + pan.x
    const originY = rect.top + rect.height / 2 + pan.y
    const wMinX = (Math.min(aX, bX) - originX) / z
    const wMaxX = (Math.max(aX, bX) - originX) / z
    const wMinY = (Math.min(aY, bY) - originY) / z
    const wMaxY = (Math.max(aY, bY) - originY) / z
    const pageFrames = useWorkspaceStore.getState().getActivePage()?.frames ?? []
    const ids = pageFrames
      .filter((f) => f.x < wMaxX && f.x + f.width > wMinX && f.y < wMaxY && f.y + f.height > wMinY)
      .map((f) => f.id)
    useWorkspaceStore.getState().setSelectedFrames(ids)
  }, [])

  const onMarqueeMove = useCallback((e: PointerEvent) => {
    const s = marqueeStart.current
    const el = containerRef.current
    if (!s || !el) return
    const rect = el.getBoundingClientRect()
    setMarqueeRectScreen({
      left: Math.min(s.clientX, e.clientX) - rect.left,
      top: Math.min(s.clientY, e.clientY) - rect.top,
      width: Math.abs(e.clientX - s.clientX),
      height: Math.abs(e.clientY - s.clientY),
    })
    selectFramesInMarquee(s.clientX, s.clientY, e.clientX, e.clientY)
  }, [selectFramesInMarquee])

  const onMarqueeUp = useCallback((e: PointerEvent) => {
    const s = marqueeStart.current
    marqueeStart.current = null
    setMarqueeRectScreen(null)
    window.removeEventListener('pointermove', onMarqueeMove)
    if (!s) return
    const moved = Math.abs(e.clientX - s.clientX) > DRAG_THRESHOLD || Math.abs(e.clientY - s.clientY) > DRAG_THRESHOLD
    if (!moved) {
      useWorkspaceStore.getState().setSelectedFrames([])                                     
    } else {
                                                           
      const ids = [...useWorkspaceStore.getState().selectedFrameIds]
      if (ids.length === 1) useWorkspaceStore.getState().setActiveFrame(ids[0])
    }
  }, [onMarqueeMove])

  const onContainerPointerDown = useCallback((e: React.PointerEvent) => {
                                                                              
                                                   
    if (e.pointerType !== 'mouse') return
                                                                                             
    if (e.target !== containerRef.current) return
    if (e.button !== 0) return
    const el = containerRef.current
    if (!el) return
    useDesignStore.getState().deselectAll()
    useWorkspaceStore.getState().setSelectedFrames([])
    marqueeStart.current = { clientX: e.clientX, clientY: e.clientY }
    const rect = el.getBoundingClientRect()
    setMarqueeRectScreen({ left: e.clientX - rect.left, top: e.clientY - rect.top, width: 0, height: 0 })
    window.addEventListener('pointermove', onMarqueeMove)
    window.addEventListener('pointerup', onMarqueeUp, { once: true })
  }, [onMarqueeMove, onMarqueeUp])

  useEffect(() => () => {
    window.removeEventListener('pointermove', onFrameDragMove)
    window.removeEventListener('pointerup', onFrameDragUp)
    window.removeEventListener('pointermove', onMarqueeMove)
    window.removeEventListener('pointerup', onMarqueeUp)
  }, [onFrameDragMove, onFrameDragUp, onMarqueeMove, onMarqueeUp])

                                                                                
                                                                               
  const coarsePointer = useCoarsePointer()
  const [brush, setBrush] = useState<{ x: number; y: number } | null>(null)
  const showBrush = !coarsePointer && (tool === 'draw' || tool === 'eraser') && !!brush
  const updateBrush = useCallback((e: React.PointerEvent) => {
    if (coarsePointer || (tool !== 'draw' && tool !== 'eraser')) { setBrush(null); return }
    const rect = activeWrapRef.current?.getBoundingClientRect()
    if (rect) setBrush({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [coarsePointer, tool])
  const brushSize = tool === 'eraser' ? 36 : Math.max(6, drawTool.strokeWidth * zoom)

                                                                                  
  const cursor = showBrush
    ? 'none'
    : tool === 'pan' ? 'grab' : tool === 'text' ? 'text' : (tool === 'shape' || tool === 'draw' || tool === 'eraser') ? 'crosshair' : hoverCursor
  const activeW = (activeFrame?.width ?? docFormat.width) * zoom
  const activeH = (activeFrame?.height ?? docFormat.height) * zoom

                                                                             
                                                                             
  const gridFormat = { width: activeFrame?.width ?? docFormat.width, height: activeFrame?.height ?? docFormat.height }
  const activeGrid = resolveGrid(gridConfig, gridFormat)

                                                             
  const layerMenuItems = (layer: Layer): ContextMenuItem[] => {
    const d = useDesignStore.getState()
    return [
      { id: 'dup', label: 'Duplicate', icon: Copy, action: () => d.duplicateLayer(layer.id) },
      { id: 'vis', label: layer.visible ? 'Hide' : 'Show', icon: layer.visible ? EyeOff : Eye, action: () => d.updateLayer(layer.id, { visible: !layer.visible }) },
      { id: 'lock', label: layer.locked ? 'Unlock' : 'Lock', icon: layer.locked ? Unlock : Lock, action: () => d.updateLayer(layer.id, { locked: !layer.locked }) },
      { id: 'fwd', label: 'Bring forward', icon: ArrowUp, separatorBefore: true, action: () => { d.pushSnapshot(); d.reorderLayer(layer.id, layer.zIndex + 1) } },
      { id: 'bwd', label: 'Send backward', icon: ArrowDown, action: () => { d.pushSnapshot(); d.reorderLayer(layer.id, Math.max(1, layer.zIndex - 1)) } },
      { id: 'del', label: 'Delete', icon: Trash2, danger: true, separatorBefore: true, action: () => { d.pushSnapshot(); d.removeLayer(layer.id) } },
    ]
  }

  const handleStackContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const d = useDesignStore.getState()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const dx = (e.clientX - rect.left) / zoom
    const dy = (e.clientY - rect.top) / zoom
    let hit: Layer | null = null
    const layers = d.document.layers
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]
      if (!l.visible || l.type === 'background') continue
      if (dx >= l.x && dx <= l.x + l.width && dy >= l.y && dy <= l.y + l.height) { hit = l; break }
    }
    if (hit) {
      d.selectLayer(hit.id)
      openMenu(e.clientX, e.clientY, layerMenuItems(hit))
    } else {
      openMenu(e.clientX, e.clientY, [
        { id: 'add-text', label: 'Add text', icon: Type, action: () => d.addLayer(createTextLayer()) },
        { id: 'add-rect', label: 'Add rectangle', icon: Square, action: () => d.addLayer({ type: 'shape', name: 'Rectangle', visible: true, locked: false, opacity: 1, x: 100, y: 100, width: 200, height: 200, rotation: 0, shape: 'rectangle', fill: getBrandColor('brand-dark'), borderRadius: 7 } as Omit<Layer, 'id' | 'zIndex'>) },
        { id: 'fit', label: 'Fit to view', icon: Maximize, separatorBefore: true, action: () => fitToFrames() },
      ])
    }
  }

  const openFrameMenu = (e: React.MouseEvent, frame: Frame) => {
    e.preventDefault()
    e.stopPropagation()
    useDesignStore.getState().deselectAll()
    setActiveFrame(frame.id)
    setSelectedFrames([frame.id])
    openMenu(e.clientX, e.clientY, [
      { id: 'rename', label: 'Rename', icon: Pencil, action: () => { setEditingName(frame.name); setEditingFrameId(frame.id) } },
      { id: 'dup', label: 'Duplicate frame', icon: Copy, action: () => duplicateFrame(frame.id) },
      { id: 'del', label: 'Delete frame', icon: Trash2, danger: true, separatorBefore: true, action: () => removeFrame(frame.id) },
    ])
  }

  const handleContainerContextMenu = (e: React.MouseEvent) => {
                                                                          
                                                                               
                                                                             
                                                                                
                                                                               
                                  
    e.preventDefault()
    openMenu(e.clientX, e.clientY, [
      { id: 'new-frame', label: 'New frame', icon: Plus, action: () => useWorkspaceStore.getState().addFrame(useDesignStore.getState().document.format) },
      { id: 'fit', label: 'Fit to view', icon: Maximize, separatorBefore: true, action: () => fitToFrames() },
    ])
  }

                                                                         
    
                                                                            
                                                             
                                                                            
                                                                              
                                                               
                                                                               
                                                                              
                                                                                 
  const editingStack = (
    <>
      
      <div className="absolute inset-0 overflow-hidden">
        <ShaderBackgroundOverlay />
        <DesignSvgScene />
      </div>

      
      <div
        ref={activeWrapRef}
        className="absolute inset-0"
        style={{ overflow: 'visible', cursor }}
        onPointerDown={(e) => { if (drawTool.onPointerDown(e)) return; handlePointerDown(e) }}
        onPointerMove={(e) => { updateBrush(e); if (drawTool.onPointerMove(e)) return; handlePointerMove(e) }}
        onPointerUp={(e) => { if (drawTool.onPointerUp()) return; handlePointerUp(e) }}
        onPointerLeave={(e) => { setBrush(null); useDesignStore.getState().setHoveredLayerId(null); if (drawTool.onPointerUp()) return; handlePointerUp(e) }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleStackContextMenu}
      >
        
        {drawTool.drawing && (
          <svg className="absolute top-0 left-0 pointer-events-none" width={activeW} height={activeH} viewBox={`0 0 ${activeFrame?.width ?? docFormat.width} ${activeFrame?.height ?? docFormat.height}`}>
            <path
              d={getDrawPath({ points: drawTool.preview, pressures: drawTool.previewPress, size: drawTool.strokeWidth, mode: drawTool.mode, thinning: drawTool.mode === 'pen' ? drawTool.thinning : undefined, taper: drawTool.mode === 'pen' ? drawTool.taper : undefined, streamline: drawTool.mode === 'pen' ? drawTool.streamline : undefined, last: false })}
              fill={drawTool.color.hex}
              fillOpacity={drawTool.mode === 'highlighter' ? HIGHLIGHTER_OPACITY : drawTool.opacity}
              style={drawTool.mode === 'highlighter' ? { mixBlendMode: 'multiply' } : undefined}
            />
          </svg>
        )}
        <AutoLayoutOverlay zoom={zoom} />
        <HoverOverlay zoom={zoom} />
        {showBrush && brush && (
          <div
            className="pointer-events-none absolute z-40 rounded-full"
            style={{
              left: brush.x,
              top: brush.y,
              width: brushSize,
              height: brushSize,
              transform: 'translate(-50%, -50%)',
              border: tool === 'eraser' ? '1.5px dashed rgba(17,17,17,0.55)' : `1.5px solid ${drawTool.color.hex}`,
              background: tool === 'eraser' ? 'rgba(17,17,17,0.05)' : 'transparent',
            }}
          />
        )}
        <SelectionOverlay zoom={zoom} panOffset={{ x: 0, y: 0 }} onResizeStart={handleResizeStart} onGroupResizeStart={handleGroupResizeStart} />
        <GridOverlay zoom={zoom} />
        <TextEditOverlay zoom={zoom} />
        <DistanceMeasurement zoom={zoom} />

        {snapGuides.length > 0 && (
          <svg className="absolute top-0 left-0 pointer-events-none" width={activeW} height={activeH} style={{ overflow: 'visible' }}>
            
            {snapGuides.map((g, i) => g.orientation === 'v'
              ? <motion.line key={`v-${i}`} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }} x1={g.position * zoom} y1={0} x2={g.position * zoom} y2={activeH} stroke="#F56139" strokeWidth={1} strokeDasharray="4 3" />
              : <motion.line key={`h-${i}`} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }} x1={0} y1={g.position * zoom} x2={activeW} y2={g.position * zoom} stroke="#F56139" strokeWidth={1} strokeDasharray="4 3" />
            )}
          </svg>
        )}

        
        {spacingGuides.length > 0 && (
          <svg className="absolute top-0 left-0 pointer-events-none" width={activeW} height={activeH} style={{ overflow: 'visible' }}>
            {spacingGuides.flatMap((sg, gi) =>
              sg.segments.map((seg, si) => {
                const vertical = sg.axis === 'y'
                const a = seg.start * zoom
                const b = seg.end * zoom
                const c = seg.cross * zoom
                const mid = (a + b) / 2
                const label = `${sg.value}`
                const badgeW = label.length * 6.5 + 10
                const bx = vertical ? c : mid
                const by = vertical ? mid : c
                return (
                  <motion.g
                    key={`sp-${gi}-${si}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {vertical ? (
                      <>
                        <line x1={c} y1={a} x2={c} y2={b} stroke="#EC4899" strokeWidth={1} />
                        <line x1={c - 4} y1={a} x2={c + 4} y2={a} stroke="#EC4899" strokeWidth={1} />
                        <line x1={c - 4} y1={b} x2={c + 4} y2={b} stroke="#EC4899" strokeWidth={1} />
                      </>
                    ) : (
                      <>
                        <line x1={a} y1={c} x2={b} y2={c} stroke="#EC4899" strokeWidth={1} />
                        <line x1={a} y1={c - 4} x2={a} y2={c + 4} stroke="#EC4899" strokeWidth={1} />
                        <line x1={b} y1={c - 4} x2={b} y2={c + 4} stroke="#EC4899" strokeWidth={1} />
                      </>
                    )}
                    <rect x={bx - badgeW / 2} y={by - 8} width={badgeW} height={16} rx={3} fill="#EC4899" />
                    <text x={bx} y={by + 4} textAnchor="middle" fill="white" fontSize={10} fontFamily="'Inter Variable', system-ui" fontWeight={600}>
                      {label}
                    </text>
                  </motion.g>
                )
              }),
            )}
          </svg>
        )}

        {marqueeRect && (
          <div className="absolute pointer-events-none border border-primary/60 bg-primary/5" style={{
            left: marqueeRect.x * zoom, top: marqueeRect.y * zoom,
            width: marqueeRect.w * zoom, height: marqueeRect.h * zoom,
            borderStyle: tool === 'shape' ? 'solid' : 'dashed',
          }} />
        )}

        
        {contentLayerCount === 0 && tool === 'select' && (
          // Type scales with the frame (design-space sizes × zoom) so it reads as
          // part of the frame, not a fixed screen overlay — with a small floor so
          // it stays legible when zoomed far out.
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center select-none"
            style={{ gap: Math.max(4, 8 * zoom), padding: `0 ${Math.max(16, 56 * zoom)}px` }}
          >
            <p className="font-medium text-foreground/70" style={{ fontSize: Math.max(11, Math.round(30 * zoom)), lineHeight: 1.2 }}>
              <RevealWords text="A frame full of potential." />
            </p>
            <motion.p
              className="text-muted-foreground/55"
              style={{ fontSize: Math.max(9, Math.round(19 * zoom)), lineHeight: 1.3 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Add some text, a shape, or an image to get going.
            </motion.p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex flex-col h-full min-w-0 bg-[#e8e8e2] overflow-hidden relative">
      
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onPointerDown={onContainerPointerDown}
        onContextMenu={handleContainerContextMenu}
        // touch-action: none lets us own pinch/pan gestures instead of the browser.
        style={{ touchAction: 'none', ...(hasFrames ? {} : { display: 'flex', alignItems: 'center', justifyContent: 'center' }) }}
      >
        {hasFrames ? (
          // --- Multi-frame world ---
          // World origin (0,0) is anchored to the viewport centre, then shifted by
          // the shared pan offset. Every frame is positioned at its world coords
          // scaled by zoom, so they share one pan/zoom space and sit side by side.
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0 0',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {frames.map((frame) => {
              const isActive = frame.id === activeFrameId
              const isSelected = selectedFrameIds.has(frame.id)
              return (
                <div
                  key={frame.id}
                  className="absolute"
                  style={{
                    left: frame.x * zoom,
                    top: frame.y * zoom,
                    width: frame.width * zoom,
                    height: frame.height * zoom,
                  }}
                >
                  
                  {showLabels && (
                    editingFrameId === frame.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); commitFrameRename() }
                          else if (e.key === 'Escape') { e.preventDefault(); setEditingFrameId(null) }
                        }}
                        onBlur={commitFrameRename}
                        onFocus={(e) => e.currentTarget.select()}
                        className="absolute -top-[26px] left-0 max-w-[220px] rounded-[5px] border border-primary bg-white px-1.5 py-1 text-[11px] leading-none text-foreground outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onPointerDown={(e) => startFrameDrag(e, frame)}
                        onContextMenu={(e) => openFrameMenu(e, frame)}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingName(frame.name); setEditingFrameId(frame.id) }}
                        title={`${frame.name} — double-click to rename`}
                        className={`absolute -top-[26px] left-0 flex max-w-full origin-bottom-left items-center gap-1 truncate rounded-[5px] px-1.5 py-1 text-[11px] leading-none outline-none transition-[color,background-color,transform] cursor-grab active:cursor-grabbing active:scale-[0.97] select-none ${
                          isActive || isSelected ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground/70 hover:bg-black/[0.04] hover:text-foreground'
                        }`}
                      >
                        <span className="truncate">{frame.name}</span>
                      </button>
                    )
                  )}

                  
                  <div
                    className={`absolute inset-0 bg-white border transition-colors ${
                      isActive ? 'border-black/15' : 'overflow-hidden border-black/10'
                    }`}
                    onPointerDown={isActive ? undefined : (e) => pickFrame(e, frame)}
                    onContextMenu={(e) => openFrameMenu(e, frame)}
                    style={{ cursor: isActive ? undefined : 'pointer' }}
                  >
                    {isActive ? editingStack : <FrameThumbnail frame={frame} zoom={zoom} />}
                  </div>

                  
                  {(isSelected || isActive) && (
                    <div className={`pointer-events-none absolute inset-0 z-10 ring-inset ${isActive ? 'ring-2 ring-primary' : 'ring-1 ring-primary/60'}`} />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // --- No frames: fresh workspace, or everything was deleted. ---
          // A real, first-impression empty state (not a phantom canvas). Text
          // only, assembles itself, then a blinking caret and a one-line CTA.
          <div className="flex flex-col items-center gap-3 px-8 text-center select-none">
            <h2 className="text-[26px] font-semibold tracking-tight text-foreground/90">
              <RevealWords text="Blank slate, big plans." stagger={0.06} />
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.14em] bg-primary/70 align-middle"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear', times: [0, 0.5, 0.5, 1] }}
              />
            </h2>
            <motion.p
              className="max-w-[330px] text-[14px] leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Add a frame and let's make something worth exporting.
            </motion.p>
            <motion.button
              type="button"
              onClick={() => useWorkspaceStore.getState().addFrame(useDesignStore.getState().document.format)}
              className="group mt-1 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary cursor-pointer transition-transform active:scale-[0.96]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.64, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Add your first frame
              <motion.span
                aria-hidden
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        )}

        
        {marqueeRectScreen && (
          <div
            className="pointer-events-none absolute z-20 rounded-[2px] border border-primary/70 bg-primary/10"
            style={{
              left: marqueeRectScreen.left,
              top: marqueeRectScreen.top,
              width: marqueeRectScreen.width,
              height: marqueeRectScreen.height,
            }}
          />
        )}

        
        <ReformatNudge />

        
        {hasFrames && <FloatingToolbar />}
        {hasFrames && <DrawQuickBar />}
      </div>

      
      <div className="h-10 bg-card border-t border-border flex items-center px-4 gap-2 shrink-0">
        <button className="p-1.5 hover:bg-muted rounded-[5px] text-muted-foreground cursor-pointer transition-transform active:scale-[0.96]" onClick={() => zoomToCentre(zoom / 1.2)}><Minus className="w-4 h-4" /></button>
        <span className="text-[13px] font-mono tabular-nums text-muted-foreground min-w-[48px] text-center">{Math.round(zoom * 100)}%</span>
        <button className="p-1.5 hover:bg-muted rounded-[5px] text-muted-foreground cursor-pointer transition-transform active:scale-[0.96]" onClick={() => zoomToCentre(zoom * 1.2)}><Plus className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded-[5px] text-muted-foreground cursor-pointer transition-transform active:scale-[0.96]" onClick={() => { if (hasFrames) { fitToFrames() } else { setZoom(1); setPanOffset({ x: 0, y: 0 }) } }} title={hasFrames ? 'Fit to frames' : 'Reset view'}><Maximize className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <div className="relative flex items-center">
          <button
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[12px] cursor-pointer transition-colors ${showGrid ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            onClick={toggleGrid}
          >
            <Grid3X3 className="w-4 h-4" />Grid
          </button>
          {showGrid && (
            <button
              className="px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-[5px] cursor-pointer tabular-nums"
              onClick={() => setGridMenuOpen(!gridMenuOpen)}
            >
              {gridPreset.charAt(0).toUpperCase() + gridPreset.slice(1)} · {activeGrid.columns}×{activeGrid.rows} ▾
            </button>
          )}
          {gridMenuOpen && showGrid && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGridMenuOpen(false)} />
              <div className="absolute bottom-full left-0 mb-1 bg-white border border-border rounded-[7px] shadow-lg py-1 min-w-[160px] z-50">
                {Object.entries(GRID_PRESETS).map(([key, config]) => {
                  const r = resolveGrid(config, gridFormat)
                  return (
                    <button
                      key={key}
                      className={`flex w-full items-center justify-between px-3 py-2 text-[13px] transition-colors cursor-pointer ${gridPreset === key ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-muted/50'}`}
                      onClick={() => { setGridPreset(key); setGridMenuOpen(false) }}
                    >
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="text-[11px] text-muted-foreground ml-2 tabular-nums">{r.columns}×{r.rows}{config.rows === 'auto' ? ' · auto' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex-1" />
        <span className="text-[12px] tabular-nums text-muted-foreground/50">{(activeFrame?.width ?? docFormat.width)} x {(activeFrame?.height ?? docFormat.height)}</span>
      </div>
    </div>
  )
};
