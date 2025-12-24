export const flux2RealisticScenes = (character: string | undefined, prompt?: string) =>
  `masterpiece, best quality, realistic scene, ${
    preset.find(e => e.name === character)?.prompt || ''
  }${prompt ? `, ${prompt}` : ''}`

const preset = [
  {
    name: 'Interior',
    prompt: 'modern interior, realistic materials, soft window light, detailed furniture, clean composition',
  },
  {
    name: 'Street Night',
    prompt: 'night street scene, neon signs, wet pavement reflections, realistic lighting, people in the distance',
  },
]
