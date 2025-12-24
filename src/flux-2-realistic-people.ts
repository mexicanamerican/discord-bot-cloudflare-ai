export const flux2RealisticPeople = (character: string | undefined, prompt?: string) =>
  `masterpiece, best quality, realistic people, ${
    preset.find(e => e.name === character)?.prompt || ''
  }${prompt ? `, ${prompt}` : ''}`

const preset = [
  {
    name: 'Business Portrait',
    prompt: '1 person, business attire, office background, natural light, realistic skin, sharp focus',
  },
  {
    name: 'Casual Portrait',
    prompt: '1 person, casual clothes, outdoor background, golden hour lighting, soft focus background',
  },
]
