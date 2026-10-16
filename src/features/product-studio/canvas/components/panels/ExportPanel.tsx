import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { exportAndDownload, exportDesign } from '@/features/product-studio/canvas/engine/compositor'
import { exportSvgAndDownload } from '@/features/product-studio/canvas/engine/svgExport'
import { playChime } from '@/features/product-studio/canvas/lib/chime'
import { SliderField } from '@/features/product-studio/canvas/components/controls/SliderField'
import { Button } from '@/features/product-studio/canvas/components/ui/button'
import { Download, Check, Copy, ClipboardCheck } from 'lucide-react'

                                                                               
                                                                  
const CAN_COPY_IMAGE = typeof navigator !== 'undefined' && 'clipboard' in navigator && typeof ClipboardItem !== 'undefined'

export const ExportPanel = () => {
  const document = useDesignStore((s) => s.document)

  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'svg'>('png')
  const [quality, setQuality] = useState(0.92)
  const [dpr, setDpr] = useState(2)
  const [exporting, setExporting] = useState(false)
  const [justExported, setJustExported] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'done'>('idle')

  const handleExport = async () => {
    setExporting(true)
    try {
      if (format === 'svg') await exportSvgAndDownload(document)
      else await exportAndDownload(document, { format, quality, dpr })
      playChime()
      setJustExported(true)
      window.setTimeout(() => setJustExported(false), 1400)
    } finally {
      setExporting(false)
    }
  }

                                                                              
                                                                                 
  const handleCopy = async () => {
    setCopyState('copying')
    try {
      const blob = await exportDesign(document, { format: 'png', quality: 1, dpr })
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopyState('done')
      window.setTimeout(() => setCopyState('idle'), 1400)
    } catch {
      setCopyState('idle')
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium">
        Export
      </div>

      
      <div className="text-[13px] text-muted-foreground tabular-nums">
        {document.format.label} — {document.format.width * dpr} x {document.format.height * dpr}px
      </div>

      
      <div className="space-y-1.5">
        <label className="text-[13px] text-muted-foreground font-normal">Format</label>
        <div className="flex gap-1">
          {(['png', 'jpg', 'webp', 'svg'] as const).map((f) => (
            <button
              key={f}
              className={`
                flex-1 py-1.5 text-[11px] rounded-[5px] uppercase transition-[color,background-color,transform] duration-150 active:scale-[0.97]
                ${format === f
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'}
              `}
              onClick={() => setFormat(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      
      {(format === 'jpg' || format === 'webp') && (
        <SliderField
          label="Quality"
          value={quality}
          min={0.1}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setQuality}
        />
      )}

      
      <div className="space-y-1.5">
        <label className="text-[13px] text-muted-foreground font-normal">Scale</label>
        <div className="flex gap-1">
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              className={`
                flex-1 py-1.5 text-[11px] rounded-[5px] transition-[color,background-color,transform] duration-150 active:scale-[0.97]
                ${dpr === d
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'}
              `}
              onClick={() => setDpr(d)}
            >
              {d}x
            </button>
          ))}
        </div>
      </div>

      
      <motion.div
        animate={justExported ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Button className="w-full rounded-[5px]" onClick={handleExport} disabled={exporting}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={exporting ? 'exporting' : justExported ? 'done' : 'idle'}
              className="inline-flex items-center"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {justExported ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? 'Exporting…' : justExported ? 'Done' : 'Export'}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>

      
      {CAN_COPY_IMAGE && (
        <Button
          variant="outline"
          className="w-full rounded-[5px]"
          onClick={handleCopy}
          disabled={copyState === 'copying'}
        >
          {copyState === 'done' ? <ClipboardCheck className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copyState === 'copying' ? 'Copying…' : copyState === 'done' ? 'Copied' : 'Copy to clipboard'}
        </Button>
      )}
    </div>
  )
};
