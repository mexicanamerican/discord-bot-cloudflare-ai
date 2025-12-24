import type { CommandContext } from 'discord-hono'
import { Button, Components, DiscordHono } from 'discord-hono'
import { flux2Dev } from './flux-2-dev'
import { flux2RealisticPeople } from './flux-2-realistic-people'
import { flux2RealisticScenes } from './flux-2-realistic-scenes'
import { lucidOrigin } from './lucid-origin'
import { phoenix10 } from './phoenix-1.0'
import { sdxlGenshin } from './sdxl-genshin'

type CommandKey =
  | 'text'
  | 'code'
  | 'math'
  | 'image'
  | 'image-genshin'
  | 'image-flux2dev'
  | 'image-lucidorigin'
  | 'image-phoenix10'
  | 'image-flux2realisticpeople'
  | 'image-flux2realisticscenes'
  | 'ja2en'
  | (string & {})

type Env = {
  Bindings: {
    AI: Ai
  }
}

// biome-ignore format: ternary operator
const defaultModel = (type: CommandKey) =>
  type === 'text' ? '@cf/mistral/mistral-7b-instruct-v0.1' :
  type === 'code' ? '@hf/thebloke/deepseek-coder-6.7b-instruct-awq' :
  type === 'math' ? '@cf/deepseek-ai/deepseek-math-7b-instruct' :
  type === 'image' ? '@cf/black-forest-labs/flux-2-dev' :
  type === 'image-genshin' ? '@cf/black-forest-labs/flux-2-dev' :
  type === 'image-flux2dev' ? '@cf/black-forest-labs/flux-2-dev' :
  type === 'image-lucidorigin' ? '@cf/leonardo/lucid-origin' :
  type === 'image-phoenix10' ? '@cf/leonardo/phoenix-1.0' :
  type === 'image-flux2realisticpeople' ? '@cf/black-forest-labs/flux-2-dev' :
  type === 'image-flux2realisticscenes' ? '@cf/black-forest-labs/flux-2-dev' :
  type === 'ja2en' ? '@cf/meta/m2m100-1.2b' :
  '@cf/mistral/mistral-7b-instruct-v0.1'

const components = new Components().row(new Button('delete-self', 'Delete', 'Secondary').emoji({ name: '🗑️' }))

/**
 * AI processing => Send to Discord waiting message
 * @param c Context
 * @param type AI type
 */
const cfai = async (c: CommandContext<Env>, type: CommandKey) => {
  try {
    const locale = c.interaction.locale.split('-')[0]
    // biome-ignore lint/suspicious/noExplicitAny: values is dynamically typed from Discord command options
    const values = c.values as any
    const prompt = (values.prompt || '').toString()
    const translation = !(locale === 'en' || values.translation === false)
    const model = (values.model || defaultModel(type)).toString()
    let content = `${model.split('/').slice(-1)[0]}\`\`\`${prompt}\`\`\`\n`
    let blobs: Blob[] = []

    const ai = c.env.AI
    const enPrompt = translation ? await m2m(ai, prompt, locale, 'en') : prompt
    if (
      !enPrompt &&
      ![
        'image-genshin',
        'image-flux2dev',
        'image-lucidorigin',
        'image-phoenix10',
        'image-flux2realisticpeople',
        'image-flux2realisticscenes',
      ].includes(type)
    )
      throw new Error('Error: Prompt Translation')

    switch (type) {
      case 'text':
      case 'code':
      case 'math': {
        const text = (await t2t(ai, model, enPrompt)) || ''
        content += translation ? await m2m(ai, text, 'en', locale) : text
        break
      }
      case 'image':
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, enPrompt)])))
        break
      case 'image-genshin': {
        const p = sdxlGenshin(values.character?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'image-flux2dev': {
        const p = flux2Dev(values.preset?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'image-lucidorigin': {
        const p = lucidOrigin(values.preset?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'image-phoenix10': {
        const p = phoenix10(values.preset?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'image-flux2realisticpeople': {
        const p = flux2RealisticPeople(values.preset?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'image-flux2realisticscenes': {
        const p = flux2RealisticScenes(values.preset?.toString(), enPrompt)
        content = `${model.split('/').slice(-1)[0]}\`\`\`${p}\`\`\`\n`
        blobs = await Promise.all([0, 1, 2].map(async () => new Blob([await t2i(ai, model, p)])))
        break
      }
      case 'ja2en': {
        const reply1 = await m2m(ai, prompt, 'japanese', 'english')
        const reply2 = await m2m(ai, reply1, 'english', 'japanese')
        content += `:arrow_down:    English    :arrow_down:\`\`\`${reply1}\`\`\`\n:arrow_down:    Japanese    :arrow_down:\`\`\`${reply2}\`\`\``
        break
      }
    }
    if (!blobs[0]) await c.followup({ content, components })
    else
      await c.followup(
        { content, components },
        blobs.map(blob => ({ blob, name: 'image.png' })),
      )
  } catch (e) {
    await c.followup({ content: 'An error occurred with AI processing', components })
    console.log(e)
  }
}

// ai core
const t2t = async (ai: Ai, model: string, prompt: string) =>
  // biome-ignore lint/suspicious/noExplicitAny: AI model parameter needs dynamic typing
  ((await ai.run(model as any, { prompt })) as { response: string }).response
const m2m = async (ai: Ai, text: string, source_lang: string, target_lang: string) =>
  // biome-ignore lint/suspicious/noExplicitAny: AI model parameter needs dynamic typing
  ((await ai.run('@cf/meta/m2m100-1.2b' as any, { text, source_lang, target_lang })) as { translated_text: string })
    .translated_text
const t2i = async (ai: Ai, model: string, prompt: string) => {
  if (model === '@cf/black-forest-labs/flux-2-dev') {
    // flux-2-dev uses 'steps' parameter instead of 'num_steps'
    // biome-ignore lint/suspicious/noExplicitAny: AI model parameter needs dynamic typing
    return (await ai.run(model as any, { prompt, steps: 25 })) as ArrayBuffer
  }
  // biome-ignore format: ternary operator
  const num_steps =
    model === '@cf/leonardo/lucid-origin' ? 20 :
    model === '@cf/leonardo/phoenix-1.0' ? 25 :
    20
  // biome-ignore lint/suspicious/noExplicitAny: AI model parameter needs dynamic typing
  return (await ai.run(model as any, { prompt, num_steps })) as ArrayBuffer
}

export default new DiscordHono<Env>()
  .command('', c => c.resDefer(c => cfai(c, c.key)))
  .component('delete-self', c => c.resDeferUpdate(c.followupDelete))
