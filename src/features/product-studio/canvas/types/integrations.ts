   
                                                 
  
                                          
                                                                                                  
                                                  
                                                                        
  
                                                                         
   

                               
                                                                 

export interface MCPTools {
                        
  'ads.createDesign': { params: { name: string; formatId: string; templateId?: string }; returns: { designId: string } }
  'ads.listDesigns': { params: { projectId: string }; returns: { designs: Array<{ id: string; name: string; status: string }> } }
  'ads.openDesign': { params: { designId: string }; returns: void }

                       
  'ads.addTextLayer': { params: { content: string; x: number; y: number; fontSize?: number; fontWeight?: number; colorToken?: string }; returns: { layerId: string } }
  'ads.addShapeLayer': { params: { shape: string; x: number; y: number; width: number; height: number; colorToken?: string }; returns: { layerId: string } }
  'ads.addImageLayer': { params: { imageUrl: string; x: number; y: number; width: number; height: number }; returns: { layerId: string } }
  'ads.addGradientLayer': { params: { gradientType: string; stops: Array<{ oklchL: number; oklchC: number; oklchH: number; position: number }> }; returns: { layerId: string } }
  'ads.updateLayer': { params: { layerId: string; updates: Record<string, unknown> }; returns: void }
  'ads.removeLayer': { params: { layerId: string }; returns: void }
  'ads.listLayers': { params: Record<string, never>; returns: { layers: Array<{ id: string; type: string; name: string }> } }

                  
  'ads.generateCopy': { params: { prompt: string; targetAudience?: string }; returns: { text: string } }
  'ads.generateDesign': { params: { prompt: string; formatId?: string }; returns: { layerCount: number } }

           
  'ads.export': { params: { format: 'png' | 'jpg' | 'webp'; dpr?: number }; returns: { blob: Blob } }
  'ads.exportAllFormats': { params: { format: 'png' | 'jpg' | 'webp' }; returns: { files: Array<{ formatId: string; blob: Blob }> } }

                       
  'ads.setStatus': { params: { designId: string; status: 'draft' | 'in-review' | 'approved' | 'rejected' }; returns: void }
  'ads.addComment': { params: { designId: string; text: string; pinX?: number; pinY?: number }; returns: void }

                                                                    
  'ads.getCanvasState': { params: Record<string, never>; returns: { format: { width: number; height: number }; layerCount: number; layers: Array<Record<string, unknown>> } }
}

                       
                                                     

export interface CLICommands {
  'create': { args: ['--name', '--format', '--template?'] }
  'export': { args: ['--design-id', '--format', '--dpr', '--output'] }
  'export-all': { args: ['--project-id', '--format', '--output-dir'] }
  'generate-copy': { args: ['--prompt', '--audience?'] }
  'generate-design': { args: ['--prompt', '--format'] }
  'list-projects': { args: [] }
  'list-designs': { args: ['--project-id'] }
  'set-status': { args: ['--design-id', '--status'] }
}

                                   
                                                        

export interface AdPlatformIntegration {
  platform: 'linkedin' | 'instagram' | 'facebook' | 'google'

                                      
  metrics: {
    impressions: number
    clicks: number
    ctr: number                               
    conversions: number
    cpa: number                                 
    spend: number
    roas: number                              
  }

                             
  creativePerformance: {
    designId: string
    formatId: string
    platform: string
    metrics: AdPlatformIntegration['metrics']
    dateRange: { start: string; end: string }
  }

                             
  optimizationActions: {
    type: 'pause' | 'increase-budget' | 'duplicate-variant' | 'update-copy' | 'change-cta'
    reason: string
    confidence: number       
    suggestedChange?: Record<string, unknown>
  }
}

                         
                                                      

export interface WebhookEvents {
  'design.created': { designId: string; projectId: string; format: string }
  'design.exported': { designId: string; format: string; dpr: number }
  'design.status.changed': { designId: string; oldStatus: string; newStatus: string }
  'design.comment.added': { designId: string; commentId: string; text: string }
  'project.created': { projectId: string; name: string }
  'ai.copy.generated': { prompt: string; result: string }
  'ai.design.generated': { prompt: string; layerCount: number }
}
