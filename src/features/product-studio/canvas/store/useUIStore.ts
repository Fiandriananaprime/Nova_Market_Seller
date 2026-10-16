import { create } from 'zustand'
import { getBrandColor } from '@/features/product-studio/canvas/brand/palette'
import type { BrandColor, DrawMode } from '@/features/product-studio/canvas/types/design'

export interface GridConfig {
  columns: number
                                                                                 
                                                                     
  rows: number | 'auto'
                                                                                 
                                                              
  marginRatio: number
  gutterRatio: number
}

                                                                       
export interface ResolvedGrid {
  columns: number
  rows: number
  padding: number
  gutter: number
  cellW: number
  cellH: number
}

                                                                             
                                                                               
                                                                             
export const resolveGrid = (
  config: GridConfig,
  format: { width: number; height: number },):ResolvedGrid => {
  const minDim = Math.min(format.width, format.height)
  const padding = Math.max(0, Math.round(config.marginRatio * minDim))
  const gutter = Math.max(0, Math.round(config.gutterRatio * minDim))
  const columns = Math.max(1, Math.round(config.columns))
  const innerW = Math.max(1, format.width - padding * 2)
  const innerH = Math.max(1, format.height - padding * 2)
  const cellW = (innerW - gutter * (columns - 1)) / columns
  const rows =
    config.rows === 'auto'
      ? Math.max(1, Math.round((innerH + gutter) / (cellW + gutter)))
      : Math.max(1, Math.round(config.rows))
  const cellH = (innerH - gutter * (rows - 1)) / rows
  return { columns, rows, padding, gutter, cellW, cellH }
};

const GRID_PRESETS: Record<string, GridConfig> = {
  thirds: { columns: 3, rows: 3, marginRatio: 0.04, gutterRatio: 0.02 },
  square: { columns: 4, rows: 'auto', marginRatio: 0.04, gutterRatio: 0.02 },
  grid: { columns: 6, rows: 'auto', marginRatio: 0.035, gutterRatio: 0.016 },
  dense: { columns: 8, rows: 'auto', marginRatio: 0.03, gutterRatio: 0.012 },
  fine: { columns: 12, rows: 'auto', marginRatio: 0.025, gutterRatio: 0.01 },
  micro: { columns: 16, rows: 'auto', marginRatio: 0.02, gutterRatio: 0.008 },
}

export type AppMode = 'basic' | 'pro'

interface UIStore {
         
  appMode: AppMode
  settingsOpen: boolean

  leftPanel: 'layers'
  rightPanel: 'inspector' | 'export' | 'auto-resize' | 'ai'

  mobileDrawer: 'layers' | 'inspector' | null

  formatSelectorOpen: boolean
  exportPanelOpen: boolean

  showGrid: boolean
  snapToGrid: boolean
  smartPadding: boolean
  gridConfig: GridConfig
  gridPreset: string

                                                                                 
  drawMode: DrawMode
                                                                             
                                                            
  drawColor: BrandColor
  highlighterColor: BrandColor
  drawWidth: number
  highlighterWidth: number
                                                                               
                                                                                
  drawThinning: number
  drawTaper: number
  drawSmoothing: number
  drawOpacity: number

                                                                           
                                   
  nudgeSmall: number
  nudgeLarge: number

            
  setAppMode: (mode: AppMode) => void
  setSettingsOpen: (open: boolean) => void
  setRightPanel: (panel: UIStore['rightPanel']) => void
  setMobileDrawer: (drawer: UIStore['mobileDrawer']) => void
  setFormatSelectorOpen: (open: boolean) => void
  setExportPanelOpen: (open: boolean) => void
  toggleGrid: () => void
  toggleSnap: () => void
  toggleSmartPadding: () => void
  setGridPreset: (preset: string) => void
  setGridConfig: (config: Partial<GridConfig>) => void
  setDrawMode: (mode: DrawMode) => void
  setDrawColor: (color: BrandColor) => void
  setHighlighterColor: (color: BrandColor) => void
  setDrawWidth: (width: number) => void
  setHighlighterWidth: (width: number) => void
  setDrawThinning: (n: number) => void
  setDrawTaper: (n: number) => void
  setDrawSmoothing: (n: number) => void
  setDrawOpacity: (n: number) => void
  setNudgeSmall: (n: number) => void
  setNudgeLarge: (n: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  appMode: 'pro' as AppMode,
  settingsOpen: false,

  leftPanel: 'layers',
  rightPanel: 'inspector',

  mobileDrawer: null,

  formatSelectorOpen: false,
  exportPanelOpen: false,

  showGrid: false,
  snapToGrid: true,
  smartPadding: true,
  gridConfig: GRID_PRESETS.grid,
  gridPreset: 'grid',

  drawMode: 'pen' as DrawMode,
  drawColor: getBrandColor('charcoal'),
  highlighterColor: getBrandColor('gold-300'),
  drawWidth: 6,
  highlighterWidth: 22,
  drawThinning: 0.55,
                                                                            
                                                                                 
                                                                                
  drawTaper: 0,
  drawSmoothing: 0.5,
  drawOpacity: 1,

  nudgeSmall: 1,
  nudgeLarge: 10,

  setAppMode: (mode) => set({ appMode: mode }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setRightPanel: (panel) => set({ rightPanel: panel }),
  setMobileDrawer: (drawer) => set({ mobileDrawer: drawer }),
  setFormatSelectorOpen: (open) => set({ formatSelectorOpen: open }),
  setExportPanelOpen: (open) => set({ exportPanelOpen: open }),
  setDrawMode: (mode) => set({ drawMode: mode }),
  setDrawColor: (color) => set({ drawColor: color }),
  setHighlighterColor: (color) => set({ highlighterColor: color }),
  setDrawWidth: (width) => set({ drawWidth: width }),
  setHighlighterWidth: (width) => set({ highlighterWidth: width }),
  setDrawThinning: (n) => set({ drawThinning: n }),
  setDrawTaper: (n) => set({ drawTaper: n }),
  setDrawSmoothing: (n) => set({ drawSmoothing: n }),
  setDrawOpacity: (n) => set({ drawOpacity: n }),
  setNudgeSmall: (n) => set({ nudgeSmall: Math.max(0.1, n) }),
  setNudgeLarge: (n) => set({ nudgeLarge: Math.max(1, n) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  toggleSmartPadding: () => set((s) => ({ smartPadding: !s.smartPadding })),

  setGridPreset: (preset) => {
    const config = GRID_PRESETS[preset]
    if (config) {
      set({ gridPreset: preset, gridConfig: config })
    }
  },

  setGridConfig: (partial) => {
    set((s) => ({
      gridConfig: { ...s.gridConfig, ...partial },
      gridPreset: 'custom',
    }))
  },
}))

export { GRID_PRESETS }
