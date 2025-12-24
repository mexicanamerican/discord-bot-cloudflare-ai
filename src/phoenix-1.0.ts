export const phoenix10 = (character: string | undefined, prompt?: string) =>
  `masterpiece, best quality, phoenix-1.0, ${
    preset.find(e => e.name === character)?.prompt || ''
  }${prompt ? `, ${prompt}` : ''}`

const preset = [
  {
    name: 'Poster',
    prompt: 'centered subject, dramatic lighting, bold contrast, space for title text, highly detailed',
  },
  {
    name: 'Landscape',
    prompt: 'realistic landscape, natural light, detailed foliage, mountains, depth and atmosphere',
  },
]
