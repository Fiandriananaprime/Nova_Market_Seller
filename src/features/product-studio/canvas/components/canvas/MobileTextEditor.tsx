import { useEffect, useRef, useState } from 'react'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { useCoarsePointer } from '@/features/product-studio/canvas/hooks/useCoarsePointer'
import type { TextLayer } from '@/features/product-studio/canvas/types/design'

   
                                                                                 
                                                                              
                                                                           
                                                                               
                                                         
   
export const MobileTextEditor = () => {
  const coarse = useCoarsePointer()
  const editingId = useDesignStore((s) => s.editingTextLayerId)
  const layer = useDesignStore((s) =>
    s.document.layers.find((l) => l.id === s.editingTextLayerId),
  ) as TextLayer | undefined
  const updateLayer = useDesignStore((s) => s.updateLayer)
  const setEditing = useDesignStore((s) => s.setEditingTextLayerId)
  const pushSnapshot = useDesignStore((s) => s.pushSnapshot)

  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')

  const active = coarse && !!editingId && layer?.type === 'text'

  useEffect(() => {
    if (!active || !layer) return
    setValue(layer.content)
                                                                                    
    const id = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
    return () => cancelAnimationFrame(id)
                                                                         
                                                           
  }, [editingId, active, layer])

  if (!active || !layer) return null

  const commit = () => {
    if (value !== layer.content) {
      pushSnapshot()
      updateLayer<TextLayer>(layer.id, { content: value })
    }
    setEditing(null)
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background md:hidden">
      <div className="flex items-center justify-between px-3 h-14 border-b border-border shrink-0">
        <button
          onClick={() => setEditing(null)}
          className="h-10 px-3 text-[15px] text-muted-foreground transition-transform active:scale-[0.96]"
        >
          Cancel
        </button>
        <span className="text-[15px] font-semibold text-foreground">Edit text</span>
        <button
          onClick={commit}
          className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-[14px] font-medium transition-transform active:scale-[0.96]"
        >
          Done
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your text…"
        className="flex-1 w-full resize-none bg-transparent px-4 py-4 text-[18px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      />
    </div>
  )
};
