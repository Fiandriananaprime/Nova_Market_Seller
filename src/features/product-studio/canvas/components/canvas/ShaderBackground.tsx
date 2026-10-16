import { motion } from 'motion/react'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'
import { renderShaderElement } from "@/features/product-studio/canvas/engine/renderShaderElement"
export const ShaderBackgroundOverlay = () => {
  const bgLayer = useDesignStore((s) =>
    s.document.layers.find((l) => l.type === 'background'),
  )

  if (!bgLayer || bgLayer.type !== 'background') return null
  const fill = bgLayer.fill
  if (fill.type !== 'shader') return null
  if (!bgLayer.visible || bgLayer.opacity <= 0) return null

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden
                                                                                   
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: bgLayer.opacity, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {renderShaderElement(fill)}
    </motion.div>
  )
};
