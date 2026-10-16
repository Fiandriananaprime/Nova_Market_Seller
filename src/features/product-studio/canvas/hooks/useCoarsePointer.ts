import { useEffect, useState } from 'react'

   
                                                                                
                                                                          
                                           
   
export const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = () => setCoarse(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return coarse
};
