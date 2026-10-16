   
                                                              
  
                                                                                    
                                                                            
                                                                                 
  
                                                                        
                                                                    
  
                                                                                
                                                                           
                                                   
   
const AI_ORIGIN = (import.meta.env.VITE_AI_API_ORIGIN as string | undefined) ?? "";
const AI_PATH = (import.meta.env.VITE_AI_API_PATH as string | undefined) ?? "/api/novamarket-ai";

                                                                        
export const AI_ENABLED = AI_ORIGIN !== "";

export const CANVAS_AI_ENDPOINT = `${AI_ORIGIN}${AI_PATH}`;

export interface CanvasAIChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: CanvasAIImageAttachment[];
}

export interface CanvasAIImageAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface CanvasAIRequest {
  model: string;
  system: string;
  messages: CanvasAIChatMessage[];
  maxTokens: number;
  stream?: boolean;
  signal?: AbortSignal;
}

/** POST to the configured AI endpoint. Credentials are included so a same-origin
 *  proxy can use session cookies; a cross-origin proxy must allow them via CORS. */
export const postCanvasAI = async (req: CanvasAIRequest):Promise<Response> => {
  if (!AI_ENABLED) {
    throw new Error(
      "AI Assist is not configured. Set VITE_AI_API_ORIGIN to point at your AI proxy endpoint.",
    );
  }

  const { signal, ...bodyFields } = req;
  const response = await fetch(CANVAS_AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(bodyFields),
    signal,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body — keep the status message
    }
    throw new Error(message);
  }

  return response;
};
