"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/features/product-studio/canvas/lib/utils"
import { toggleVariants } from "@/features/product-studio/canvas/components/ui/toggleVariants"

const Toggle = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) => {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
};

export { Toggle }
