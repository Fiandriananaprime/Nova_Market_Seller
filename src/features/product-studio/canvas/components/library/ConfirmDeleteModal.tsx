import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Trash2 } from 'lucide-react'

interface Props {
  open: boolean
                                                                    
  itemName?: string
                                                      
  kind?: string
  onConfirm: () => void
  onCancel: () => void
}

   
                                                                                 
                                                                              
                                                                             
   
export const ConfirmDeleteModal = ({ open, itemName, kind = 'file', onConfirm, onCancel }: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    }
    window.addEventListener('keydown', onKey)
                                                                       
    const raf = requestAnimationFrame(() => cancelRef.current?.focus())
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(raf) }
  }, [open, onCancel])

  if (!open) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
          
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

          
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="relative w-full max-w-[380px] rounded-[20px] bg-white p-6 shadow-[0_24px_70px_-16px_rgba(0,0,0,0.35),0_2px_8px_-2px_rgba(0,0,0,0.1)]"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              aria-hidden
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 420, damping: 24 }}
            >
              <Trash2 className="h-5 w-5" />
            </motion.div>

            <h2 id="confirm-delete-title" className="text-[17px] font-semibold tracking-tight text-foreground">
              Delete {itemName ? `“${itemName}”` : `this ${kind}`}?
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {kind === 'folder'
                ? 'This removes the folder. Files inside it move back to Files. You can’t undo this.'
                : 'This permanently removes it. You can’t undo this.'}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="rounded-[10px] px-4 py-2.5 text-[13px] font-medium text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-[0.96]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-[10px] bg-destructive px-4 py-2.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-destructive/90 active:scale-[0.96]"
              >
                Delete
              </button>
            </div>
          </motion.div>
    </motion.div>
  )
};
