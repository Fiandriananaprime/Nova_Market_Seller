                                                  
const imageCache = new Map<string, HTMLImageElement>()

export const getOrLoadImage = (url: string):HTMLImageElement | null => {
  const cached = imageCache.get(url)
  if (cached) return cached

  const img = new Image()
  img.onload = () => imageCache.set(url, img)
  img.src = url
  return null
};

                                                    
export const svgImageCache = new Map<string, HTMLImageElement>()
