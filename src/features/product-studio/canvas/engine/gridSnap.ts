import { resolveGrid, type GridConfig } from "@/features/product-studio/canvas/store/useUIStore"

export const getGridSnapTargets = (
  format: { width: number; height: number },
  gridConfig: GridConfig,
): { snapX: number[]; snapY: number[] } => {
  const { columns, rows, padding, gutter, cellW, cellH } = resolveGrid(gridConfig, format)
  const snapX: number[] = [padding]
  const snapY: number[] = [padding]
  for (let col = 0; col <= columns; col++) {
    const x = padding + col * (cellW + gutter)
    snapX.push(Math.round(x))
    if (col < columns) snapX.push(Math.round(x + cellW))
  }
  for (let row = 0; row <= rows; row++) {
    const y = padding + row * (cellH + gutter)
    snapY.push(Math.round(y))
    if (row < rows) snapY.push(Math.round(y + cellH))
  }
  return { snapX: [...new Set(snapX)], snapY: [...new Set(snapY)] }
}
