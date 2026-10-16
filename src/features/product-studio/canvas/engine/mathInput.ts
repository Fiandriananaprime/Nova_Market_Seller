                                                                           
                                                                            
                                                                               
                                                                               
                                                                             
export const evalScalar = (expr: string, fallback: number):number => {
  const s = expr.trim()
  if (s === '') return fallback

                                                                               
                                                                               
                                                                 
  if (!/^[0-9+\-*/(). ]+$/.test(s)) return fallback

                                                                   
  const direct = Number(s)
  if (!Number.isNaN(direct)) return Number.isFinite(direct) ? direct : fallback

  try {
                                           
    const val = Function(`"use strict"; return (${s});`)() as unknown
    return typeof val === 'number' && Number.isFinite(val) ? val : fallback
  } catch {
    return fallback
  }
};
