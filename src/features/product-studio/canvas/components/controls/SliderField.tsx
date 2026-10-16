import { useCallback } from 'react'
import { Slider } from '@/features/product-studio/canvas/components/ui/slider'
import { Label } from '@/features/product-studio/canvas/components/ui/label'

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  format?: (v: number) => string
                                                                                 
  snapTo?: number[]
}

export const SliderField = ({ label, value, min, max, step, onChange, format, snapTo }: SliderFieldProps) => {
  const handleChange = useCallback(
    (val: number | readonly number[]) => {
      let v = Array.isArray(val) ? val[0] : (typeof val === 'number' ? val : val[0])
      if (snapTo) {
        const threshold = (max - min) * 0.03
        for (const snap of snapTo) {
          if (Math.abs(v - snap) < threshold) {
            v = snap
            break
          }
        }
      }
      onChange(v)
    },
    [onChange, snapTo, min, max]
  )

  const display = format
    ? format(value)
    : step < 0.01
      ? value.toFixed(3)
      : step < 1
        ? value.toFixed(2)
        : Math.round(value).toString()

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[13px] text-muted-foreground font-normal">{label}</Label>
        <span className="text-[12px] font-mono tabular-nums text-muted-foreground/60">{display}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleChange}
      />
    </div>
  )
};
