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
  new BooleanOption('translation', '自動翻訳（デフォルト True）'),
  new Option('model', `選択モデル（デフォルト ${defaultModel}）`).choices(
    ...models.map(m => ({ name: m.split('/').slice(-1)[0], value: m })).sort((a, b) => a.name.localeCompare(b.name)),
  ),
]

const commands = [
  new Command('text', 'AIチャット').options(...options('AIに聞く内容', 'mistral-7b-instruct-v0.1', textModels)),
  new Command('code', 'コード補助').options(...options('AIに聞く内容', 'deepseek-coder-6.7b-instruct-awq', codeModels)),
  new Command('math', '数学の解決').options(...options('AIに聞く内容', 'deepseek-math-7b-instruct', mathModels)),
  new Command('image', '画像生成').options(...options('画像の要素', 'dreamshaper-8-lcm', imageModels)),
  new Command('image-genshin', '画像生成＋原神プリセット').options(
    new Option('character', 'キャラクター選択')
      .required()
      .choices(
        { name: '神里綾華', value: 'Kamisato Ayaka' },
        { name: '雷電将軍', value: 'Raiden Shogun' },
        { name: '胡桃', value: 'Hu Tao' },
        { name: 'モナ', value: 'Mona' },
      ),
    new Option('prompt', '追加の呪文'),
    new BooleanOption('translation', '自動翻訳（デフォルト True）'),
    new Option('model', '選択モデル（デフォルト stable-diffusion-xl-base-1.0）').choices(
      ...imageModels
        .map(m => ({ name: m.split('/').slice(-1)[0], value: m }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
  ),
  new Command('ja2en', '英語に翻訳').options(new Option('prompt', '翻訳する日本語').required()),
]

register(
  commands,
  env.DISCORD_APPLICATION_ID,
  env.DISCORD_TOKEN,
  //env.DISCORD_TEST_GUILD_ID,
)
