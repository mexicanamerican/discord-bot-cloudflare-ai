import { BooleanOption, Command, Option, register } from 'discord-hono'
import { config } from 'dotenv'

const envResult = config({ path: '.dev.vars' })
const env = envResult.parsed || {}

if (!env.DISCORD_APPLICATION_ID || !env.DISCORD_TOKEN) {
  throw new Error(
    'Missing required environment variables DISCORD_APPLICATION_ID and/or DISCORD_TOKEN. ' +
      'Please create a .dev.vars file with these values for local development.',
  )
}

// Manual model lists based on Cloudflare Workers AI documentation
// https://developers.cloudflare.com/workers-ai/models/
const textModels = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-3.2-3b-instruct',
  '@cf/meta/llama-3.2-1b-instruct',
  '@cf/meta/llama-3.1-70b-instruct',
  '@cf/meta/llama-3.1-8b-instruct',
  '@cf/meta/llama-3-8b-instruct',
  '@cf/mistral/mistral-7b-instruct-v0.1',
  '@cf/mistral/mistral-7b-instruct-v0.2-lora',
  '@cf/qwen/qwen1.5-14b-chat-awq',
  '@cf/qwen/qwen1.5-7b-chat-awq',
  '@cf/qwen/qwen1.5-1.8b-chat',
  '@cf/qwen/qwen1.5-0.5b-chat',
  '@cf/google/gemma-7b-it',
  '@cf/google/gemma-2b-it-lora',
  '@hf/thebloke/neural-chat-7b-v3-1-awq',
  '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
  '@hf/thebloke/zephyr-7b-beta-awq',
  '@hf/nexusflow/starling-lm-7b-beta',
  '@hf/nousresearch/hermes-2-pro-mistral-7b',
]

const codeModels = [
  '@cf/deepseek-ai/deepseek-coder-6.7b-instruct-awq',
  '@hf/thebloke/deepseek-coder-6.7b-instruct-awq',
  '@hf/thebloke/codellama-7b-instruct-awq',
  '@cf/deepseek-ai/deepseek-coder-7b-instruct-v1.5',
]

const mathModels = [
  '@cf/deepseek-ai/deepseek-math-7b-instruct',
  '@cf/deepseek-ai/deepseek-math-7b-base',
  '@cf/meta/llama-3.1-70b-instruct',
  '@cf/meta/llama-3.1-8b-instruct',
]

const imageModels = [
  '@cf/black-forest-labs/flux-2-dev',
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/leonardo/phoenix-1.0',
  '@cf/leonardo/lucid-origin',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/stabilityai/stable-diffusion-xl-lightning',
  '@cf/stabilityai/stable-diffusion-xl-turbo',
  '@cf/lykon/dreamshaper-8-lcm',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/runwayml/stable-diffusion-v1-5-img2img',
  '@cf/runwayml/stable-diffusion-v1-5-inpainting',
]

const options = (promptDesc: string, defaultModel: string, models: string[]) => [
  new Option('prompt', promptDesc).required(),
  new BooleanOption('translation', 'Auto translation (default True)'),
  new Option('model', `Select model (default ${defaultModel})`).choices(
    ...models.map(m => ({ name: m.split('/').slice(-1)[0], value: m })).sort((a, b) => a.name.localeCompare(b.name)),
  ),
]

const commands = [
  new Command('text', 'AI Chat').options(...options('Content to ask AI', 'mistral-7b-instruct-v0.1', textModels)),
  new Command('code', 'Code Assistance').options(
    ...options('Content to ask AI', 'deepseek-coder-6.7b-instruct-awq', codeModels),
  ),
  new Command('math', 'Math Problem Solving').options(
    ...options('Content to ask AI', 'deepseek-math-7b-instruct', mathModels),
  ),
  new Command('image', 'Image Generation').options(...options('Image elements', 'flux-2-dev', imageModels)),
  new Command('image-genshin', 'Image Generation + Genshin Impact Preset').options(
    new Option('character', 'Character selection')
      .required()
      .choices(
        { name: 'Kamisato Ayaka', value: 'Kamisato Ayaka' },
        { name: 'Raiden Shogun', value: 'Raiden Shogun' },
        { name: 'Hu Tao', value: 'Hu Tao' },
        { name: 'Mona', value: 'Mona' },
      ),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default flux-2-dev)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('image-flux2dev', 'Image Generation + Flux 2 Dev Preset').options(
    new Option('preset', 'Preset selection')
      .required()
      .choices({ name: 'Cinematic Portrait', value: 'Cinematic Portrait' }, { name: 'Cityscape', value: 'Cityscape' }),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default flux-2-dev)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('image-lucidorigin', 'Image Generation + Lucid Origin Preset').options(
    new Option('preset', 'Preset selection')
      .required()
      .choices({ name: 'Graphic Design', value: 'Graphic Design' }, { name: 'HD Render', value: 'HD Render' }),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default lucid-origin)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('image-phoenix10', 'Image Generation + Phoenix 1.0 Preset').options(
    new Option('preset', 'Preset selection')
      .required()
      .choices({ name: 'Poster', value: 'Poster' }, { name: 'Landscape', value: 'Landscape' }),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default phoenix-1.0)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('image-flux2realisticpeople', 'Image Generation + Flux 2 Realistic People Preset').options(
    new Option('preset', 'Preset selection')
      .required()
      .choices(
        { name: 'Business Portrait', value: 'Business Portrait' },
        { name: 'Casual Portrait', value: 'Casual Portrait' },
      ),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default flux-2-dev)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('image-flux2realisticscenes', 'Image Generation + Flux 2 Realistic Scenes Preset').options(
    new Option('preset', 'Preset selection')
      .required()
      .choices({ name: 'Interior', value: 'Interior' }, { name: 'Street Night', value: 'Street Night' }),
    new Option('prompt', 'Additional prompt'),
    new BooleanOption('translation', 'Auto translation (default True)'),
    new Option('model', 'Select model (default flux-2-dev)').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('ja2en', 'Translate to English').options(new Option('prompt', 'Japanese text to translate').required()),
]

register(
  commands,
  env.DISCORD_APPLICATION_ID,
  env.DISCORD_TOKEN,
  //env.DISCORD_TEST_GUILD_ID,
)
