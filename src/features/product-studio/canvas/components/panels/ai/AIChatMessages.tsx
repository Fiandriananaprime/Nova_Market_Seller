import { useState } from 'react'
import { useDesignStore, createTextLayer } from '@/features/product-studio/canvas/store/useDesignStore'
import { getBrandColor } from '@/features/product-studio/canvas/brand/palette'
import {
  Wand2,
  Copy,
  Target,
  Plus,
} from 'lucide-react'
import LatticeLoader from '@/components/LatticeLoader.jsx'
import type { AIImageAttachment } from '@/features/product-studio/canvas/components/panels/ai/types'
import type { TextLayer, ShapeLayer, BackgroundLayer } from '@/features/product-studio/canvas/types/design'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
                                                                     
  designLayers?: unknown[]
                                                      
  isCopy?: boolean
  attachments?: AIImageAttachment[]
                  
  ts: number
}

                                        

const applyDesignLayers = (jsonStr: string):boolean => {
  try {
                                                       
    const jsonMatch = jsonStr.match(/```json?\s*\n?([\s\S]*?)```/)
    const cleanJson = jsonMatch ? jsonMatch[1].trim() : jsonStr.trim()
    const layers = JSON.parse(cleanJson)

    if (!Array.isArray(layers)) return false

    const store = useDesignStore.getState()
    const format = store.document.format
    store.pushSnapshot()

                                       
    const existing = store.document.layers.filter((l) => l.type !== 'background')
    for (const l of existing) {
      store.removeLayer(l.id)
    }

    for (const layer of layers) {
      if (layer.type === 'text') {
        store.addLayer({
          type: 'text',
          name: layer.name || 'AI Text',
          visible: true, locked: false, opacity: 1,
          x: layer.x, y: layer.y, width: layer.width, height: layer.height,
          rotation: 0,
          content: layer.content,
          fontSize: layer.fontSize || 32,
          fontWeight: layer.fontWeight || 400,
          textAlign: layer.textAlign || 'left',
          color: getBrandColor(layer.colorToken || 'charcoal'),
          letterSpacing: layer.letterSpacing ?? -0.01,
          lineHeight: layer.lineHeight ?? 1.2,
          textTransform: layer.textTransform || 'none',
          textWrap: 'pretty',
          textSizing: 'fixed',
          textRole: 'none',
          verticalAlign: 'top',
        } as Omit<TextLayer, 'id' | 'zIndex'>)
      } else if (layer.type === 'shape') {
        if (layer.x === 0 && layer.y === 0 && layer.width >= format.width && layer.height >= format.height) {
          const bgLayer = store.document.layers.find((l) => l.type === 'background')
          if (bgLayer) {
            store.updateLayer<BackgroundLayer>(bgLayer.id, {
              fill: { type: 'solid', color: getBrandColor(layer.colorToken || 'cloud') },
            })
          }
        } else {
          store.addLayer({
            type: 'shape',
            name: layer.name || 'AI Shape',
            visible: true, locked: false, opacity: 1,
            x: layer.x, y: layer.y, width: layer.width, height: layer.height,
            rotation: 0,
            shape: layer.shape || 'rectangle',
            fill: getBrandColor(layer.colorToken || 'brand-dark'),
            borderRadius: layer.borderRadius ?? 7,
          } as Omit<ShapeLayer, 'id' | 'zIndex'>)
        }
      }
    }
    return true
  } catch {
    return false
  }
};

                         

export const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user'
  const hasDesignJson = /```json?\s*\n?\[[\s\S]*?\][\s\S]*?```/.test(message.content)

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`
          px-3 py-2 rounded-[8px] text-[13px] leading-relaxed max-w-[95%]
          ${isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/40 text-foreground'
          }
        `}
      >
        <MessageContent content={message.content} />
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.attachments.map((attachment) => (
              <img
                key={attachment.id}
                src={attachment.dataUrl}
                alt={attachment.name}
                title={attachment.name}
                loading="lazy"
                className="max-h-36 w-full rounded-md border border-white/20 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      
      {!isUser && (
        <MessageActions content={message.content} hasDesignJson={hasDesignJson} />
      )}
    </div>
  )
};

// --- Render message content with code blocks ---

const MessageContent = ({ content }: { content: string }) => {
  // Split on code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const codeContent = part.replace(/```json?\n?/, '').replace(/```$/, '').trim()
          return (
            <div key={i} className="my-2 p-2 bg-black/5 rounded-[4px] text-[11px] font-mono overflow-x-auto max-h-[120px] overflow-y-auto">
              {codeContent}
            </div>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </div>
  )
};

                                 

const MessageActions = ({ content, hasDesignJson }: { content: string; hasDesignJson: boolean }) => {
  const activeLayerId = useDesignStore((s) => s.activeLayerId)
  const [applied, setApplied] = useState(false)

                                                                 
  const plainText = content.replace(/```[\s\S]*?```/g, '').trim()

  const applyToSelected = () => {
    if (!plainText || !activeLayerId) return
    const store = useDesignStore.getState()
    const layer = store.getLayer(activeLayerId)
    if (layer?.type === 'text') {
      store.pushSnapshot()
      store.updateLayer<TextLayer>(activeLayerId, { content: plainText })
      setApplied(true)
      setTimeout(() => setApplied(false), 2000)
    }
  }

  const addAsNewLayer = () => {
    if (!plainText) return
    useDesignStore.getState().addLayer(createTextLayer({ content: plainText }))
  }

  const applyDesign = () => {
    const success = applyDesignLayers(content)
    if (success) {
      setApplied(true)
      setTimeout(() => setApplied(false), 2000)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(plainText || content)
  }

  return (
    <div className="flex flex-wrap gap-1 px-0.5">
      {hasDesignJson && (
        <button
          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-primary/10 text-primary rounded-[4px] hover:bg-primary/20 cursor-pointer transition-[color,background-color,transform] active:scale-[0.96]"
          onClick={applyDesign}
        >
          <Wand2 className="w-3 h-3" />
          {applied ? 'Applied!' : 'Apply design'}
        </button>
      )}
      {plainText && (
        <>
          {activeLayerId && (
            <button
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-primary/10 text-primary rounded-[4px] hover:bg-primary/20 cursor-pointer transition-[color,background-color,transform] active:scale-[0.96]"
              onClick={applyToSelected}
            >
              <Target className="w-3 h-3" />
              {applied ? 'Applied!' : 'Apply to selected'}
            </button>
          )}
          <button
            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-muted/60 text-muted-foreground rounded-[4px] hover:bg-muted cursor-pointer transition-[color,background-color,transform] active:scale-[0.96]"
            onClick={addAsNewLayer}
          >
            <Plus className="w-3 h-3" />
            Add as text
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-muted/60 text-muted-foreground rounded-[4px] hover:bg-muted cursor-pointer transition-[color,background-color,transform] active:scale-[0.96]"
            onClick={copyToClipboard}
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </>
      )}
    </div>
  )
};

                                    

export const StreamingMessage = ({ content }: { content: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="px-3 py-2 rounded-[8px] bg-muted/40 text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
        {content}
        <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      </div>
    </div>
  )
};

export const ThinkingIndicator = () => {
  return (
    <div className="px-3 py-2 text-primary">
      <LatticeLoader />
    </div>
  )
};
