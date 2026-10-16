                                                                           
                                                                                
                                                                             
                                                                      
const AVATAR_URLS = Object.entries(
  import.meta.glob('../assets/avatars/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>,
)
                                                              
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

export const AVATAR_COUNT = AVATAR_URLS.length

                                                                               
export const SAMPLE_AVATAR_URL = AVATAR_URLS[0] ?? ''

let lastIndex = -1

                                                                            
export const randomAvatarUrl = (): string => {
  if (AVATAR_URLS.length === 0) return ''
  if (AVATAR_URLS.length === 1) return AVATAR_URLS[0]
  let i = lastIndex
  while (i === lastIndex) i = Math.floor(Math.random() * AVATAR_URLS.length)
  lastIndex = i
  return AVATAR_URLS[i]
};

   
                                                                           
                                                                               
                                                                              
                                                                
   
export const fetchAsDataUrl = async (url: string):Promise<string> => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
};

   
                                                                              
                                                                            
                                                                               
                                                                               
   
export const randomAvatarDataUrl = async (exclude?: string):Promise<string> => {
  for (let i = 0; i < 8; i++) {
    const dataUrl = await fetchAsDataUrl(randomAvatarUrl())
    if (dataUrl !== exclude) return dataUrl
  }
  return fetchAsDataUrl(randomAvatarUrl())
};
