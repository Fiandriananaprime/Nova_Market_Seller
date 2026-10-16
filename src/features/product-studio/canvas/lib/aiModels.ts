                                                                              
                                                                              
                                                                               

export interface AIModelOption {
  id: string
  label: string
}

export const AI_MODELS: AIModelOption[] = [
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 — balanced (recommended)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 — best quality' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — fastest' },
]

export const DEFAULT_AI_MODEL = 'claude-sonnet-5'

   
                                                                            
                                                               
                                                                                
                                                       
   
export const normalizeAIModel = (id: string):string => {
  if (AI_MODELS.some((m) => m.id === id)) return id
  const hint = id.toLowerCase()
  if (hint.includes('haiku')) return 'claude-haiku-4-5'
  if (hint.includes('opus')) return 'claude-opus-4-8'
  return DEFAULT_AI_MODEL
};
