import { create } from 'zustand'

export type Route =
  | { page: 'library' }
  | { page: 'settings' }
  | { page: 'project'; projectId: string }
  | { page: 'editor'; projectId: string; designId: string }
  | { page: 'editor-standalone' }

interface RouterStore {
  route: Route
  navigate: (route: Route) => void
}

   
                                                                                 
                                                                                
                                                                                 
                                                                                 
   
const initialRoute = (): Route => {
  if (typeof window !== 'undefined') {
    const view = new URLSearchParams(window.location.search).get('view')
    if (view === 'editor') return { page: 'editor-standalone' }
    if (view === 'files') return { page: 'library' }
  }
  return { page: 'library' }
};

export const useRouterStore = create<RouterStore>((set) => ({
  route: initialRoute(),
  navigate: (route) => set({ route }),
}))
