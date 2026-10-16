import { dispatch, getSchema } from './commands'

   
                                                                                      
                                                                          
                                                             
  
                                                             
                                                                 
                                                                               
  
                                                                                        
                                                                                    
                                                                                 
                                                                  
   

const SOURCE = 'tela-agent'

interface CommandMessage {
  source: string
  type: 'command'
  id?: string | number
  command: { op: string; [k: string]: unknown }
}

const isCommandMessage = (d: unknown):d is CommandMessage => {
  return !!d && typeof d === 'object' && (d as CommandMessage).source === SOURCE && (d as CommandMessage).type === 'command'
};

export const installAgentRpc = (): (() => void) => {
  if (typeof window === 'undefined') return () => {}

                                                                              
                                                                           
  ;(window as unknown as { tela: unknown }).tela = { dispatch, getSchema }

  const onMessage = async (e: MessageEvent) => {
    if (!isCommandMessage(e.data)) return
    const source = e.source as Window | null
    const result = await dispatch(e.data.command)
    const reply = { source: SOURCE, type: 'command-result', id: e.data.id, result }
                                                       
    source?.postMessage(reply, { targetOrigin: '*' })
  }

  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
};
