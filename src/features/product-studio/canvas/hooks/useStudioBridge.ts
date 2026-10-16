import { useEffect, useRef } from 'react'
import { useRouterStore, type Route } from '@/features/product-studio/canvas/store/useRouterStore'
import { useDesignStore } from '@/features/product-studio/canvas/store/useDesignStore'

   
                                                                              
                                         
                                                                            
                                                                         
                                                                         
                                                
  
                                                                                 
                                                                         
                                                                              
   

const SOURCE = 'tela-canvas'
type View = 'editor' | 'files'

const viewForRoute = (route: Route):View => {
  return route.page === 'library' ? 'files' : 'editor'
};

const isEmbedded = () => typeof window !== 'undefined' && window.parent !== window

export const useStudioBridge = () => {
  const route = useRouterStore((s) => s.route)
  const lastPosted = useRef<View | null>(null)

                                                         
  useEffect(() => {
    if (!isEmbedded()) return
    const view = viewForRoute(route)
    if (lastPosted.current === view) return
    lastPosted.current = view
    const message: { source: string; type: string; view: View; designId?: string } = {
      source: SOURCE,
      type: 'navigate',
      view,
    }
    if (route.page === 'editor') message.designId = route.designId
    window.parent.postMessage(message, window.location.origin)
  }, [route])

                                                    
  useEffect(() => {
    if (!isEmbedded()) return
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      const data = e.data
      if (!data || data.source !== SOURCE || data.type !== 'show') return
      const { navigate } = useRouterStore.getState()
      if (data.view === 'files') navigate({ page: 'library' })
      else navigate({ page: 'editor-standalone' })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const openImage = (event: Event) => {
      const { image, name } = (event as CustomEvent<{ image: string; name: string }>).detail
      if (!image) return
      const store = useDesignStore.getState()
      store.resetDocument()
      store.setDocumentName(name || 'Photo produit')
      const bitmap = new Image()
      bitmap.onload = () => {
        const { width, height } = useDesignStore.getState().document.format
        const scale = Math.min(width / bitmap.naturalWidth, height / bitmap.naturalHeight)
        const layerWidth = bitmap.naturalWidth * scale
        const layerHeight = bitmap.naturalHeight * scale
        useDesignStore.getState().addLayer({
          type: 'image', name: name || 'Photo produit', visible: true, locked: false, opacity: 1,
          x: (width - layerWidth) / 2, y: (height - layerHeight) / 2,
          width: layerWidth, height: layerHeight, rotation: 0, imageUrl: image,
          fit: 'contain', cropX: 0, cropY: 0, cropW: 1, cropH: 1, borderRadius: 0, aspectRatioLocked: true,
        })
      }
      bitmap.src = image
    }
    window.addEventListener('novamarket-studio:open-image', openImage)
    return () => window.removeEventListener('novamarket-studio:open-image', openImage)
  }, [])
};
