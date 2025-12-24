export const lucidOrigin = (character: string | undefined, prompt?: string) =>
  `masterpiece, best quality, lucid-origin, ${
    preset.find(e => e.name === character)?.prompt || ''
  }${prompt ? `, ${prompt}` : ''}`

const preset = [
  {
    name: 'Graphic Design',
    prompt: 'clean vector style, sharp shapes, bold colors, centered composition, flat background',
  },
  {
    name: 'HD Render',
    prompt: 'high detail 3d render, smooth materials, studio lighting, realistic reflections',
  },
]
