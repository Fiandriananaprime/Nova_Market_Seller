import type { CSSProperties, ReactElement } from "react"
import {
  MeshGradient,
  Warp,
  GrainGradient,
  Swirl,
  Dithering,
  Waves,
} from "@paper-design/shaders-react"
import type { ShaderFill } from "@/features/product-studio/canvas/types/design"

const lerp = (t: number, a: number, b: number) => a + (b - a) * Math.max(0, Math.min(1, t))

interface RenderOpts {
  speed?: number
  frame?: number
  style?: CSSProperties
}

const FILL_STYLE: CSSProperties = { width: "100%", height: "100%", display: "block" }

export const renderShaderElement = (fill: ShaderFill, opts: RenderOpts = {}): ReactElement => {
  const speed = opts.speed ?? fill.speed
  const frame = opts.frame ?? fill.frame
  const style = { ...FILL_STYLE, ...opts.style }
  const colors = fill.colors.length ? fill.colors : ["#2563eb"]
  const common = { speed, frame, scale: fill.scale, rotation: fill.rotation, fit: "cover" as const, style }

  switch (fill.kind) {
    case "warp":
      return (
        <Warp
          {...common}
          colors={colors}
          distortion={lerp(fill.intensity, 0.1, 0.45)}
          swirl={lerp(fill.intensity, 0.2, 0.9)}
          softness={0.9}
          proportion={0.45}
        />
      )
    case "grainGradient":
      return (
        <GrainGradient
          {...common}
          colors={colors}
          colorBack={colors[colors.length - 1]}
          intensity={lerp(fill.intensity, 0.1, 0.6)}
          noise={lerp(fill.grain, 0.25, 1)}
          softness={0.8}
        />
      )
    case "swirl":
      return (
        <Swirl
          {...common}
          colors={colors}
          bandCount={Math.round(lerp(fill.intensity, 2, 9))}
          twist={lerp(fill.intensity, 0.1, 0.9)}
          noise={fill.grain}
        />
      )
    case "dithering":
      return (
        <Dithering
          {...common}
          colorFront={colors[0]}
          colorBack={colors[1] ?? "#f8f8f3"}
          size={Math.round(lerp(1 - fill.intensity, 1, 6))}
        />
      )
    case "waves":
      return (
        <Waves
          {...common}
          colorFront={colors[0]}
          colorBack={colors[1] ?? "#f8f8f3"}
          amplitude={lerp(fill.intensity, 0.2, 0.9)}
          frequency={lerp(fill.scale, 0.6, 1.4)}
        />
      )
    case "meshGradient":
    default:
      return (
        <MeshGradient
          {...common}
          colors={colors}
          distortion={lerp(fill.intensity, 0.4, 1)}
          swirl={lerp(fill.intensity, 0, 0.6)}
          grainOverlay={fill.grain}
        />
      )
  }
}
