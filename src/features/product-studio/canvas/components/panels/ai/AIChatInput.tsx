import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  ImagePlus,
  PenLine,
  LayoutTemplate,
  Lightbulb,
  Send,
  X,
} from 'lucide-react'
import type { AIImageAttachment } from '@/features/product-studio/canvas/components/panels/ai/types'

export type QuickAction = 'copy' | 'design' | 'hooks'

interface AIChatInputProps {
  input: string
  setInput: (value: string) => void
  isStreaming: boolean
  onSend: (text: string, attachments: AIImageAttachment[]) => void
  onQuickAction: (action: QuickAction) => void
  onStop: () => void
}

const MAX_IMAGES = 4
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const readImage = (file: File):Promise<AIImageAttachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Impossible de lire l’image « ${file.name} ».`))
        return
      }

      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        dataUrl: reader.result,
      })
    }

    reader.onerror = () => reject(reader.error ?? new Error(`Impossible de lire l’image « ${file.name} ».`))
    reader.readAsDataURL(file)
  })
};

export const AIChatInput = ({
  input,
  setInput,
  isStreaming,
  onSend,
  onQuickAction,
  onStop,
}: AIChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<AIImageAttachment[]>([])
  const [uploadError, setUploadError] = useState('')
  const [isPreparingAttachments, setIsPreparingAttachments] = useState(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (files.length === 0 || isStreaming) return

    const availableSlots = MAX_IMAGES - attachments.length
    const accepted: File[] = []
    const errors: string[] = []

    for (const file of files) {
      if (accepted.length >= availableSlots) {
        errors.push(`Maximum ${MAX_IMAGES} images par message.`)
        break
      }
      if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        errors.push(`${file.name} : format non pris en charge (JPEG, PNG, WebP ou GIF).`)
        continue
      }
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name} dépasse la limite de 5 Mo.`)
        continue
      }
      accepted.push(file)
    }

    setUploadError(errors.join(' '))
    if (accepted.length === 0) return

    setIsPreparingAttachments(true)
    try {
      const loadedImages = await Promise.all(accepted.map(readImage))
      setAttachments((current) => [...current, ...loadedImages])
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Une image n’a pas pu être lue.')
    } finally {
      setIsPreparingAttachments(false)
    }
  }

  const handleSend = () => {
    const prompt = input.trim()
    if ((!prompt && attachments.length === 0) || isStreaming || isPreparingAttachments) return

    onSend(
      prompt || 'Please review the attached image(s) in the context of my ad.',
      attachments,
    )
    setAttachments([])
    setUploadError('')
    setInput('')
  }

  return (
    <div className="shrink-0 border-t border-border p-2 space-y-2">
      {!isStreaming && attachments.length === 0 && (
        <div className="flex gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 text-[11px] bg-muted/50 hover:bg-muted rounded-[5px] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => onQuickAction('copy')}
          >
            <PenLine className="w-3 h-3" />
            Write copy
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 text-[11px] bg-muted/50 hover:bg-muted rounded-[5px] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => onQuickAction('design')}
          >
            <LayoutTemplate className="w-3 h-3" />
            Design ad
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 text-[11px] bg-muted/50 hover:bg-muted rounded-[5px] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => onQuickAction('hooks')}
          >
            <Lightbulb className="w-3 h-3" />
            Hooks
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Images jointes">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img src={attachment.dataUrl} alt={attachment.name} className="h-full w-full object-cover" />
              {!isStreaming && (
                <button
                  type="button"
                  aria-label={`Retirer ${attachment.name}`}
                  title={`Retirer ${attachment.name}`}
                  onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-foreground/75 p-0.5 text-background hover:bg-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <p role="alert" className="text-[11px] text-destructive">
          {uploadError}
        </p>
      )}

      <div className="flex gap-1.5 items-end rounded-xl border border-border bg-card p-1.5 focus-within:ring-1 focus-within:ring-primary/40">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={handleFilesSelected}
          disabled={isStreaming || isPreparingAttachments || attachments.length >= MAX_IMAGES}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || isPreparingAttachments || attachments.length >= MAX_IMAGES}
          title="Joindre des images (JPEG, PNG, WebP, GIF · 5 Mo max)"
          aria-label="Joindre des images"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <textarea
          className="min-h-[36px] max-h-[100px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[13px] leading-snug text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          placeholder="Ask anything about your ad..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button
            type="button"
            className="shrink-0 rounded-lg bg-destructive/10 p-2 text-destructive transition-[color,background-color,transform] hover:bg-destructive/20 active:scale-[0.96] cursor-pointer"
            onClick={onStop}
            title="Stop"
            aria-label="Stop generating"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            className="shrink-0 rounded-lg bg-primary p-2 text-primary-foreground transition-[color,background-color,transform] hover:bg-primary/90 active:scale-[0.96] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isPreparingAttachments}
            title={isPreparingAttachments ? 'Préparation des images…' : 'Send'}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
      {isPreparingAttachments && (
        <p role="status" className="text-[11px] text-muted-foreground">
          Préparation des images…
        </p>
      )}
    </div>
  )
};
