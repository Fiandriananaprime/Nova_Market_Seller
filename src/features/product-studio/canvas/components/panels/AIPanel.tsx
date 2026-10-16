import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIStore } from '@/features/product-studio/canvas/store/useAIStore'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { Sparkles, Settings } from 'lucide-react'
import type { TextLayer, ShapeLayer, BackgroundLayer } from '@/features/product-studio/canvas/types/design'

import { streamAIResponse } from '@/features/product-studio/canvas/components/panels/ai/streamParser'
import { MessageBubble, StreamingMessage, ThinkingIndicator } from '@/features/product-studio/canvas/components/panels/ai/AIChatMessages'
import type { ChatMessage } from '@/features/product-studio/canvas/components/panels/ai/AIChatMessages'
import { AIChatInput } from '@/features/product-studio/canvas/components/panels/ai/AIChatInput'
import type { QuickAction } from '@/features/product-studio/canvas/components/panels/ai/AIChatInput'
import type { AIImageAttachment } from '@/features/product-studio/canvas/components/panels/ai/types'
import { AISettingsInline } from '@/features/product-studio/canvas/components/panels/ai/AISettingsInline'
import { getCurrentUser } from '@/service/auth'

                                                  

const buildSystemPrompt = (action?: QuickAction):string => {
  const ai = useAIStore.getState()
  const design = useDesignStore.getState()
  const format = design.document.format
  const layers = design.document.layers

  const layerSummary = layers.map((l, i) => {
    const base = `[${i}] ${l.type} "${l.name}" (${l.x},${l.y} ${l.width}x${l.height})`
    if (l.type === 'text') return `${base} content="${(l as TextLayer).content}" fontSize=${(l as TextLayer).fontSize}`
    if (l.type === 'shape') return `${base} shape=${(l as ShapeLayer).shape}`
    if (l.type === 'background') return `${base} fill=${JSON.stringify((l as BackgroundLayer).fill)}`
    return base
  }).join('\n')

  const contextBlock = `
Product: ${ai.productName}
Description: ${ai.productDescription}
Target Audience: ${ai.targetAudience}
Brand Voice: ${ai.brandVoice}
Default CTA: ${ai.callToAction}

Canvas: ${format.width}x${format.height} (${format.label})
Current layers:
${layerSummary}

Available brand colors: charcoal (#100f0f), white (#ffffff), cloud (#f8f8f3), paper (#f2f2eb), brand-dark (#0f172a), brand-primary (#2563eb), brand-accent (#dbeafe), ember-500 (#F56139)
`

  if (action === 'design') {
    return `You are an expert ad designer working inside an ad creation tool. You have full context about the current canvas and product.

${contextBlock}

When asked to design an ad, return a JSON array of layers wrapped in a \`\`\`json code block. Each layer is:
- Text: { "type": "text", "name": "string", "x": number, "y": number, "width": number, "height": number, "content": "string", "fontSize": number, "fontWeight": 300|400|500|600|700, "textAlign": "left"|"center"|"right", "colorToken": "charcoal"|"white"|"brand-primary"|"ember-500", "letterSpacing": number, "lineHeight": number, "textTransform": "none"|"uppercase" }
- Shape: { "type": "shape", "name": "string", "x": number, "y": number, "width": number, "height": number, "shape": "rectangle"|"ellipse"|"pill", "colorToken": "brand-dark"|"ember-500"|"brand-accent", "borderRadius": 0|5|7|12|9999 }

The FIRST layer should be a full-canvas rectangle as the background color.
Position elements with proper spacing (40-80px padding from edges).
Use clear visual hierarchy: large headline, smaller subtext, prominent CTA.

You can also chat normally. Only output the JSON block when designing. Add a brief description before the JSON.`
  }

  if (action === 'hooks') {
    return `You are an expert ad copywriter specializing in attention-grabbing hooks and headlines.

${contextBlock}

Generate hooks/headlines that are punchy, under 10 words, and use different angles (pain point, aspiration, curiosity, social proof, urgency, contrarian). Format each on its own line.`
  }

  // Default / copy mode
  return `You are an expert ad copywriter and creative assistant working inside an ad creation tool. You can write copy, suggest designs, and help with ad strategy.

${contextBlock}

Rules:
- Be concise and direct — ads have limited space
- Write for the target audience
- Match the brand voice
- No hashtags unless asked
- No emojis unless asked
- When writing copy that could be applied to a layer, keep it clean (just the text)
- When asked to design, output a JSON array in a \`\`\`json code block (same format as the design mode)
- You can discuss strategy, give feedback on the current design, or brainstorm ideas`
};

                      

const EmptyState = ({ onQuickAction }: { onQuickAction: (a: QuickAction) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-medium text-foreground">AI Ad Assistant</p>
        <p className="text-[12px] text-muted-foreground max-w-[200px]">
          Write copy, design layouts, or generate hooks for your ad.
        </p>
      </div>
      <div className="space-y-1.5 w-full max-w-[220px]">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] bg-muted/40 hover:bg-muted/70 rounded-[6px] transition-colors cursor-pointer text-foreground/80"
          onClick={() => onQuickAction('copy')}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Write ad copy
        </button>
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] bg-muted/40 hover:bg-muted/70 rounded-[6px] transition-colors cursor-pointer text-foreground/80"
          onClick={() => onQuickAction('design')}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Design an ad layout
        </button>
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] bg-muted/40 hover:bg-muted/70 rounded-[6px] transition-colors cursor-pointer text-foreground/80"
          onClick={() => onQuickAction('hooks')}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Generate hooks
        </button>
      </div>
    </div>
  )
};

const isChatMessage = (value: unknown):value is ChatMessage => {
  if (typeof value !== 'object' || value === null
    || !('id' in value) || typeof value.id !== 'string'
    || !('role' in value) || (value.role !== 'user' && value.role !== 'assistant')
    || !('content' in value) || typeof value.content !== 'string'
    || !('ts' in value) || typeof value.ts !== 'number') return false

  if ('attachments' in value && value.attachments !== undefined) {
    if (!Array.isArray(value.attachments) || !value.attachments.every((attachment) =>
      typeof attachment === 'object' && attachment !== null
      && 'name' in attachment && typeof attachment.name === 'string'
      && 'mimeType' in attachment && typeof attachment.mimeType === 'string'
      && 'dataUrl' in attachment && typeof attachment.dataUrl === 'string')) return false
  }
  return true
};

const readChatHistory = (storageKey: string):ChatMessage[] => {
  const serialized = localStorage.getItem(storageKey)
  if (!serialized) return []

  const messages: unknown = JSON.parse(serialized)
  if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
    throw new Error('Saved AI chat history is invalid.')
  }
  return messages
};

                         

const ChatInterface = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const [historyReady, setHistoryReady] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const historyStorageKey = chatUserId
    ? `novamarket.product-studio.chat.${chatUserId}`
    : null

  useEffect(() => {
    let active = true
    getCurrentUser().then(({ userId }) => {
      if (!active) return
      const storageKey = `novamarket.product-studio.chat.${userId}`
      setChatUserId(userId)
      try {
        const storedMessages = readChatHistory(storageKey)
        setMessages(storedMessages)
        setHistoryReady(true)
      } catch (error: unknown) {
        console.error('[AIPanel] Failed to load account chat history:', error)
        setHistoryError('Your saved AI chat could not be loaded. Clear its saved history to continue.')
      }
    }).catch((error: unknown) => {
      if (!active) return
      console.error('[AIPanel] Failed to identify the current seller:', error)
      setHistoryError('Your seller account could not be verified. The AI chat is unavailable.')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!historyStorageKey || !historyReady) return
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(messages))
    } catch (error: unknown) {
      console.error('[AIPanel] Failed to save account chat history:', error)
      setHistoryError('Your AI chat history could not be saved. Check available browser storage.')
    }
  }, [historyReady, historyStorageKey, messages])

  const clearSavedHistory = () => {
    if (!historyStorageKey) return
    try {
      const messagesToKeep = historyReady ? messages : []
      localStorage.removeItem(historyStorageKey)
      localStorage.setItem(historyStorageKey, JSON.stringify(messagesToKeep))
      setMessages(messagesToKeep)
      setHistoryError(null)
      setHistoryReady(true)
    } catch (error: unknown) {
      console.error('[AIPanel] Failed to clear account chat history:', error)
      setHistoryError('The saved AI chat history could not be cleared.')
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  const sendMessage = useCallback(async (
    text: string,
    action?: QuickAction,
    attachments: AIImageAttachment[] = [],
  ) => {
    if ((!text.trim() && attachments.length === 0) || isStreaming || !historyReady || !chatUserId) return

    const ai = useAIStore.getState()
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      attachments,
      ts: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    // Build conversation history (last 20 messages for context window)
    const history = [...messages, userMsg].slice(-20).map((message) => ({
      role: message.role,
      content: message.content,
      ...(message.id === userMsg.id && attachments.length > 0
        ? {
            attachments: attachments.map(({ name, mimeType, dataUrl }) => ({
              name,
              mimeType,
              dataUrl,
            })),
          }
        : {}),
    }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const fullText = await streamAIResponse({
        model: ai.model,
        system: buildSystemPrompt(action),
        messages: history,
        maxTokens: action === 'design' ? 2000 : 1000,
        signal: controller.signal,
        onDelta: (delta) => {
          setStreamingContent((prev) => prev + delta)
        },
      })

      // Check if response contains a design JSON block
      const hasDesignJson = /```json?\s*\n?\[[\s\S]*?\][\s\S]*?```/.test(fullText)

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullText,
        designLayers: hasDesignJson ? [] : undefined,
        isCopy: action === 'copy' || action === 'hooks',
        ts: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled
        const partialMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streamingContent || '(cancelled)',
          ts: Date.now(),
        }
        setMessages((prev) => [...prev, partialMsg])
      } else {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          ts: Date.now(),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      abortRef.current = null
    }
  }, [chatUserId, historyReady, isStreaming, messages, streamingContent])

  const handleQuickAction = useCallback((action: QuickAction) => {
    const prompts: Record<QuickAction, string> = {
      copy: 'Write compelling ad copy for the current design.',
      design: 'Design an ad layout for this canvas.',
      hooks: 'Generate 6 attention-grabbing hooks/headlines.',
    }
    sendMessage(prompts[action], action)
  }, [sendMessage])

  const stopStreaming = () => {
    abortRef.current?.abort()
  }

  return (
    <div className="flex flex-col h-full -m-3">
      
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-medium text-foreground">AI Assistant</span>
          {historyReady && <span className="text-[10px] text-muted-foreground">Saved to this account</span>}
        </div>
        <button
          className="p-1.5 rounded-[5px] text-muted-foreground hover:bg-muted transition-[color,background-color,transform] active:scale-[0.96] cursor-pointer"
          onClick={onOpenSettings}
          title="AI Settings"
          aria-label="AI settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
        {!historyReady && (
          <div role={historyError ? "alert" : "status"} className="py-4 text-center text-xs text-muted-foreground space-y-2">
            <p>{historyError ?? "Loading your account chat…"}</p>
            {historyError && historyStorageKey && (
              <button type="button" className="text-primary underline" onClick={clearSavedHistory}>
                Clear saved history and retry
              </button>
            )}
          </div>
        )}
        {historyReady && historyError && (
          <div role="alert" className="py-2 text-center text-xs text-rose-600 space-y-2">
            <p>{historyError}</p>
            <button type="button" className="text-primary underline" onClick={clearSavedHistory}>
              Clear saved history and retry
            </button>
          </div>
        )}
        {historyReady && !historyError && messages.length === 0 && !isStreaming && (
          <EmptyState onQuickAction={handleQuickAction} />
        )}

        {historyReady && messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        
        {historyReady && isStreaming && streamingContent && (
          <StreamingMessage content={streamingContent} />
        )}

        {historyReady && isStreaming && !streamingContent && (
          <ThinkingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      
      {historyReady && !historyError && (
        <AIChatInput
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          onSend={(text, attachments) => sendMessage(text, undefined, attachments)}
          onQuickAction={handleQuickAction}
          onStop={stopStreaming}
        />
      )}
    </div>
  )
};

// --- Main AIPanel component ---

export const AIPanel = () => {
  const [showSettings, setShowSettings] = useState(false)

  if (showSettings) {
    return <AISettingsInline onDone={() => setShowSettings(false)} showBackButton />
  }

  return <ChatInterface onOpenSettings={() => setShowSettings(true)} />
};
