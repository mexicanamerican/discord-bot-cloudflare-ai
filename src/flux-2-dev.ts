export const flux2Dev = (character: string | undefined, prompt?: string) =>
  `masterpiece, best quality, flux2-dev, ${
    preset.find(e => e.name === character)?.prompt || ''
  }${prompt ? `, ${prompt}` : ''}`

const preset = [
  {
    name: 'Cinematic Portrait',
    prompt: '1 person, cinematic portrait, realistic skin, soft key light, shallow depth of field, detailed eyes',
  },
  {
    name: 'Cityscape',
    prompt: 'wide cityscape, realistic lighting, detailed buildings, atmospheric depth, natural colors',
  },
]
