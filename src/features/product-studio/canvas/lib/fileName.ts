                                                                             
                                                                           
                                                   

const ADJECTIVES = [
  'amber', 'azure', 'bright', 'calm', 'coral', 'crisp', 'dawn', 'dusk', 'ember',
  'fern', 'gentle', 'golden', 'hazel', 'ivory', 'jade', 'lively', 'lunar', 'misty',
  'noble', 'olive', 'opal', 'pale', 'quiet', 'rose', 'sage', 'slate', 'soft',
  'still', 'sunny', 'swift', 'teal', 'velvet', 'warm', 'wild', 'zephyr',
]

const FLOWERS = [
  'aster', 'azalea', 'bluebell', 'camellia', 'clover', 'crocus', 'dahlia',
  'daisy', 'foxglove', 'freesia', 'iris', 'jasmine', 'lilac', 'lily', 'lotus',
  'magnolia', 'marigold', 'orchid', 'peony', 'poppy', 'primrose', 'protea',
  'ranunculus', 'sunflower', 'thistle', 'tulip', 'verbena', 'violet', 'zinnia',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

                                                                                 
export const generateFileName = (taken: readonly string[] = []):string => {
  const used = new Set(taken.map((n) => n.toLowerCase()))
  for (let i = 0; i < 12; i++) {
    const name = `${pick(ADJECTIVES)}-${pick(FLOWERS)}`
    if (!used.has(name)) return name
  }
  // Extremely unlikely fallback: disambiguate with a short suffix.
  return `${pick(ADJECTIVES)}-${pick(FLOWERS)}-${Math.floor(Math.random() * 900 + 100)}`
};
