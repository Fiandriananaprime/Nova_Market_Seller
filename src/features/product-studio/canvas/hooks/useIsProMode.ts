import { useUIStore } from '@/features/product-studio/canvas/store/useUIStore'

/** Returns true when `appMode === 'pro'`. Wrap Pro-only UI sections with this. */
export function useIsProMode(): boolean {
  return useUIStore((s) => s.appMode) === 'pro'
}
