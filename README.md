## Quick Deploy

Deploy this Discord bot to Cloudflare Workers with one click:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mexicanamerican/discord-bot-cloudflare-ai)

After deployment, you'll need to configure your Discord bot credentials as secrets (see [Setup Discord Bot](#setup-discord-bot) section below).

## Fork, Clone, Install

[Fork and Clone](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)

```sh
cd discord-bot-cloudflare-ai
npm i
```

## Setup Workers AI

This project now uses the native [Cloudflare Workers AI binding](https://developers.cloudflare.com/workers-ai/configuration/bindings/). The AI Gateway setup (ACCOUNT_ID and AI_API_TOKEN) is no longer required.

The Workers AI binding is automatically configured in `wrangler.toml` and is available as `env.AI` in the code.

## Setup Discord Bot

Create a New Application from [Dashboard](https://discord.com/developers/applications).  
Copy your `APPLICATION ID`, `PUBLIC KEY` and `TOKEN`, and put them in a `.dev.vars` file for local development.

Storing secrets for production:

```shell
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_TOKEN
```

Register commands and Deploy:

```shell
npm run register
npm run deploy
```

Enter `https://YOUR_PROJECT.YOUR_DOMAIN.workers.dev` in the [INTERACTIONS ENDPOINT URL](https://discord.com/developers/applications).

Create an invite URL from [Dashboard](https://discord.com/developers/applications).  
`YOUR_APP` > `OAuth2` tab > `OAuth2 URL Generator` > Check SCOPES: `bot` > URL `Copy`  
Paste the URL into the browser.
