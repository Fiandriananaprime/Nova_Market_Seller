   
                                                        
  
                                                                         
                                                       
  
                                                                              
                                                                               
                                                                             
                                                                             
                                                                              
                                                                            
                                                                   
  
                                                                                
                                                                           
                                     
   

                                            
const makeRng = (seed: string):() => number => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
};

                                                                                 
                                                               
                                                                      
const ANCHOR_HUES = [
  255,                       
  238,        
  262,              
  210,       
  195,        
  158,         
  92,                      
  38,                       
  350,        
  300,          
]

const okl = (l: number, c: number, h: number) =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${(((h % 360) + 360) % 360).toFixed(1)})`

// A few blob layouts (percent positions for the focal/mid/light stops). A seed
// picks one; small jitter keeps repeats from looking identical.
const LAYOUTS: { focal: [number, number]; mid: [number, number]; light: [number, number]; angle: number }[] = [
  { focal: [78, 74], mid: [30, 30], light: [60, 88], angle: 155 },
  { focal: [22, 78], mid: [70, 32], light: [48, 20], angle: 200 },
  { focal: [26, 24], mid: [76, 66], light: [90, 20], angle: 135 },
  { focal: [74, 26], mid: [28, 70], light: [16, 30], angle: 165 },
  { focal: [50, 82], mid: [20, 26], light: [82, 40], angle: 180 },
]

/** CSS `background`: a soft single-band OKLCH wash with a richer focal glow. */
export const cardGradient = (seed: string):string => {
  const rng = makeRng(seed)

  // Anchor hue + a small per-card jitter so two cards on the same band still differ.
  const H = ANCHOR_HUES[Math.floor(rng() * ANCHOR_HUES.length)] + Math.round(rng() * 10 - 5)
  // Overall depth: some cards lean lighter/airier, some a touch deeper.
  const depth = 0.9 + rng() * 0.2 // 0.9..1.1 multiplier on chroma
  const c = (base: number) => +(base * depth).toFixed(3)

  // One hue band: light → deep, with gentle hue torsion (±8°) and rising chroma.
  const neutral = okl(0.958, c(0.012), H) // near-white, faintly tinted — breathing room
  const tint = okl(0.9, c(0.05), H + 8)
  const light = okl(0.84, c(0.088), H + 3)
  const mid = okl(0.76, c(0.12), H)
  const deep = okl(0.67, c(0.145), H - 8)

  const L = LAYOUTS[Math.floor(rng() * LAYOUTS.length)]
  const jit = (p: [number, number]): [number, number] => [
    Math.round(p[0] + (rng() * 8 - 4)),
    Math.round(p[1] + (rng() * 8 - 4)),
  ]
  const [fx, fy] = jit(L.focal)
  const [mx, my] = jit(L.mid)
  const [lx, ly] = jit(L.light)

  return [
    // Focal glow — smaller + deepest, one intentional bright spot.
    `radial-gradient(70% 70% at ${fx}% ${fy}%, ${deep} 0%, transparent 48%)`,
    // Mid wash — the main colour body.
    `radial-gradient(115% 105% at ${mx}% ${my}%, ${mid} 0%, transparent 60%)`,
    // Light lift — keeps the top airy.
    `radial-gradient(120% 120% at ${lx}% ${ly}%, ${light} 0%, transparent 64%)`,
    // Base: near-white neutral → soft tint, so the card never goes flat.
    `linear-gradient(${L.angle}deg, ${neutral}, ${tint})`,
  ].join(', ')
};
