declare module "@/components/CrystalizedBall.jsx" {
  type CrystalizedBallProps = {
    preset?: "plasma" | "aurora" | "nebula" | "ember" | "frost" | "solar" | "eclipse" | "abyss"
    color?: string
    theme?: "dark" | "light"
    size?: number
    particleCount?: number
    interactive?: boolean
    intro?: boolean
    paused?: boolean
    className?: string
    style?: import("react").CSSProperties
  }

  const CrystalizedBall: import("react").ComponentType<CrystalizedBallProps>
  export default CrystalizedBall
}

declare module "@/components/LatticeLoader.jsx" {
  type LatticeLoaderProps = {
    label?: string
    doneLabel?: string
    errorLabel?: string
    status?: "working" | "done" | "error"
    pattern?: string
    grid?: 3 | 4
    shape?: "round" | "square"
    color?: string
    doneColor?: string
    errorColor?: string
    cellSize?: number
    gap?: number
    fontSize?: number
    step?: number
    idleOpacity?: number
    glow?: boolean
    glowColor?: string
    showTimer?: boolean
    elapsed?: number
    className?: string
    style?: import("react").CSSProperties
  }

  const LatticeLoader: import("react").ComponentType<LatticeLoaderProps>
  export default LatticeLoader
}
