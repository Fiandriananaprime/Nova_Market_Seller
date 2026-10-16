import { useRef, useEffect, useCallback } from 'react'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { useCoarsePointer } from '@/features/product-studio/canvas/hooks/useCoarsePointer'
import { FONT_FAMILY } from '@/features/product-studio/canvas/engine/textMeasure'
import type { TextLayer } from '@/features/product-studio/canvas/types/design'

interface Props {
  zoom: number
}

   
                                                                               
                                                                            
                                                                               
  
                                                                             
                                                                              
                                                                              
                                                                        
   
export const TextEditOverlay = ({ zoom }: Props) => {
  const editingTextLayerId = useDesignStore((s) => s.editingTextLayerId)
  const layers = useDesignStore((s) => s.document.layers)
  const updateLayer = useDesignStore((s) => s.updateLayer)
  const setEditingTextLayerId = useDesignStore((s) => s.setEditingTextLayerId)
  const pushSnapshot = useDesignStore((s) => s.pushSnapshot)

  const ref = useRef<HTMLDivElement>(null)
  const isCommitting = useRef(false)
                                                                           
  const coarse = useCoarsePointer()

  const layer = editingTextLayerId
    ? (layers.find((l) => l.id === editingTextLayerId) as TextLayer | undefined)
    : null

                                                                                  
                                                                             
  useEffect(() => {
    if (!layer || !ref.current) return
    const el = ref.current
    el.textContent = layer.content
    requestAnimationFrame(() => {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
    pushSnapshot()
    isCommitting.current = false
  }, [layer, pushSnapshot])

  const commit = useCallback(() => {
    if (isCommitting.current) return
    isCommitting.current = true
    if (ref.current && layer && ref.current.innerText !== layer.content) {
      updateLayer<TextLayer>(layer.id, { content: ref.current.innerText })
    }
    setEditingTextLayerId(null)
  }, [layer, updateLayer, setEditingTextLayerId])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      commit()
    }
                                                                             
    e.stopPropagation()
  }, [commit])

                                                                
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  if (!layer || coarse) return null

  const x = layer.x * zoom
  const y = layer.y * zoom
  const w = layer.width * zoom
  const fontSize = layer.fontSize * zoom
  const autoWidth = (layer.textSizing ?? 'fixed') === 'auto-width'

  const decoration =
    [layer.underline && 'underline', layer.strikethrough && 'line-through']
      .filter(Boolean)
      .join(' ') || undefined

  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
                                                                               
                                                                            
    width: autoWidth ? 'max-content' : w,
    minWidth: autoWidth ? w : undefined,
    fontFamily: FONT_FAMILY,
    fontSize,
    fontWeight: layer.fontWeight,
    color: layer.color.hex,
    textAlign: layer.textAlign,
                                                                                  
    letterSpacing: `${layer.letterSpacing * fontSize}px`,
    lineHeight: layer.lineHeight,
    textTransform: layer.textTransform,
    textDecoration: decoration,
    whiteSpace: autoWidth ? 'pre' : 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    padding: 0,
    // Outline (not border) so the text box isn't inset — text stays put.
    outline: '2px solid #2563eb',
    outlineOffset: '0px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.15)',
    caretColor: layer.color.hex,
    zIndex: 100,
    cursor: 'text',
  }
  // Match the scene's cap trim exactly, so the editor's line box is the same
  // height as the rendered (and stored) layer height. CSSProperties lacks types
  // for these, hence the assign.
  if ((layer.verticalTrim ?? 'cap') === 'cap') {
    Object.assign(style, { textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic' })
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={style}
      // Commit live so the box re-hugs as you type (auto-width grows sideways,
      // auto-height grows down) instead of clipping until blur.
      onInput={(e) => updateLayer<TextLayer>(layer.id, { content: (e.target as HTMLDivElement).innerText })}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  )
};
