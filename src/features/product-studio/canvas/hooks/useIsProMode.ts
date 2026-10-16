import { useUIStore } from '@/features/product-studio/canvas/store/useUIStore'

                                                                                  
export const useIsProMode = (): boolean => {
  return useUIStore((s) => s.appMode) === 'pro'
};
