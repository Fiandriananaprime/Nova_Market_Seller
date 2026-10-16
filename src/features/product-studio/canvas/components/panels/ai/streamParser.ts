                                                          
  
                                                                              
                                                                       
                                                                             
                                                                              
             

import { postCanvasAI } from '@/features/product-studio/canvas/lib/aiApi'
import type { CanvasAIChatMessage } from '@/features/product-studio/canvas/lib/aiApi'

export const streamAIResponse = async (options: {
  model: string
  system: string
  messages: CanvasAIChatMessage[]
  maxTokens: number
  onDelta: (text: string) => void
  signal?: AbortSignal
}):Promise<string> => {
  const response = await postCanvasAI({
    model: options.model,
    system: options.system,
    messages: options.messages,
    maxTokens: options.maxTokens,
    stream: true,
    signal: options.signal,
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

                                   
    const lines = buffer.split('\n')
                                                
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const data = JSON.parse(payload)
        if (data.error) throw new Error(data.error)
        if (typeof data.text === 'string' && data.text) {
          fullText += data.text
          options.onDelta(data.text)
        }
      } catch (err) {
                                                                          
                                  
        if (err instanceof Error && err.message && !(err instanceof SyntaxError)) {
          throw err
        }
      }
    }
  }

  return fullText
};
