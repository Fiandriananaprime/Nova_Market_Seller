type HapticStyle = 'light' | 'medium' | 'heavy'

const DURATION: Record<HapticStyle, number> = { light: 8, medium: 14, heavy: 24 }

   
                                                                           
                                                                          
                       
  
                                                                                
                                                                              
                                                              
   
export const haptic = (style: HapticStyle = 'light'):void => {
  if (typeof navigator === 'undefined') return
  navigator.vibrate?.(DURATION[style])
};
