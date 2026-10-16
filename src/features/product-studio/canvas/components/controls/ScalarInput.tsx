import { useState } from 'react'
import { Input } from '@/features/product-studio/canvas/components/ui/input'
import { evalScalar } from '@/features/product-studio/canvas/engine/mathInput'

interface Props {
  value: number
  onCommit: (n: number) => void
  className?: string
  min?: number
}

   
                                                                               
                                                                              
                                                                              
                                                                             
   
export const ScalarInput = ({ value, onCommit, className, min }: Props) => {
  const [draft, setDraft] = useState(String(Math.round(value)))
  const [editing, setEditing] = useState(false)
                                                                             
                                                                               
                                                                             
  const [lastValue, setLastValue] = useState(value)
  if (!editing && value !== lastValue) {
    setLastValue(value)
    setDraft(String(Math.round(value)))
  }

  const clamp = (n: number) => (min != null ? Math.max(min, n) : n)

  const commit = (raw: string) => {
    const n = clamp(Math.round(evalScalar(raw, value)))
    onCommit(n)
    setDraft(String(n))
    setEditing(false)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      className={className}
      value={draft}
      onFocus={() => setEditing(true)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        const el = e.currentTarget
        if (e.key === 'Enter') {
          commit(el.value)
          el.blur()
        } else if (e.key === 'Escape') {
          setDraft(String(Math.round(value)))
          setEditing(false)
          el.blur()
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          const step = (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1)
          const next = clamp(Math.round(evalScalar(el.value, value)) + step)
          setDraft(String(next))
          onCommit(next)
        }
      }}
    />
  )
};
