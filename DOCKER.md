# Docker Setup for Discord Bot Cloudflare AI

This bot can be run in Docker for easy deployment and management. Two docker-compose configurations are provided:

1. **docker-compose.yml** - Standard format for general use
2. **docker-compose.portainer.yml** - Portainer-specific format with logging and external volume paths

## Prerequisites

- Docker and Docker Compose installed
- Discord bot credentials (see main README.md)
- A `.dev.vars` file with your secrets

## Configuration

### Cloudflare API and Account ID

**Important:** The Cloudflare API key and Account ID are **NOT required** for local development when using `wrangler dev --local`.

The `--local` flag makes Wrangler run the Workers AI binding in local mode, which means:
- The AI binding is available via `env.AI` in your code
- No Cloudflare account credentials are needed
- The AI models run through Cloudflare's infrastructure when you use the binding

However, if you want to deploy to Cloudflare Workers (production), you'll need:
1. Cloudflare Account ID - found in your Cloudflare dashboard
2. Cloudflare API Token - generated from Cloudflare dashboard

These are configured through `wrangler` CLI for deployment:
```bash
npx wrangler login  # Authenticate with Cloudflare
npm run deploy       # Deploy to Workers
```

### Discord Bot Credentials

Create a `.dev.vars` file in the project root with your Discord credentials:

```bash
DISCORD_APPLICATION_ID="your_application_id"
DISCORD_PUBLIC_KEY="your_public_key"
DISCORD_TOKEN="your_bot_token"
DISCORD_TEST_GUILD_ID="your_test_guild_id"
```

You can copy `example.dev.vars` as a template:
```bash
cp example.dev.vars .dev.vars
# Then edit .dev.vars with your actual credentials
```

## Using Standard Docker Compose

The standard `docker-compose.yml` uses local volumes and is suitable for development:

```bash
# Build and start the bot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the bot
docker-compose down
```

**Volume Mapping:**
- `./.dev.vars` → `/app/.dev.vars` (read-only) - Your Discord credentials
- `./node_modules` → `/app/node_modules` - Cached dependencies for faster restarts
- `./.wrangler` → `/app/.wrangler` - Wrangler persistence data

## Using Portainer Docker Compose

The `docker-compose.portainer.yml` is designed for use with Portainer and uses external volume paths:

### Setup for Portainer:

1. **Create the required directories** on your host:
   ```bash
   mkdir -p /portainer/Files/AppData/Config/discord-bot-cloudflare-ai/node_modules
   mkdir -p /portainer/Files/AppData/Config/discord-bot-cloudflare-ai/wrangler
   ```

2. **Copy your `.dev.vars` file** to the Portainer config directory:
   ```bash
   cp .dev.vars /portainer/Files/AppData/Config/discord-bot-cloudflare-ai/.dev.vars
   ```

3. **Deploy via Portainer:**
   - In Portainer, go to "Stacks" → "Add Stack"
   - Upload the `docker-compose.portainer.yml` file
   - Or paste its contents into the web editor
   - Click "Deploy the stack"

**Volume Mapping:**
- `/portainer/Files/AppData/Config/discord-bot-cloudflare-ai/.dev.vars` → `/app/.dev.vars` (read-only)
- `/portainer/Files/AppData/Config/discord-bot-cloudflare-ai/node_modules` → `/app/node_modules`
- `/portainer/Files/AppData/Config/discord-bot-cloudflare-ai/wrangler` → `/app/.wrangler`

**Features:**
- Logging configured with JSON file driver
- Max 5 log files, 10MB each
- Automatic restart unless manually stopped
- Persistent volumes for fast container restarts

## Port Mapping

The bot exposes port `8787` which is used by `wrangler dev`:
- Host: `8787` → Container: `8787`
- Access the development server at `http://localhost:8787`

## Dockerfile Details

The included `Dockerfile` uses:
- **Base Image:** `node:20-slim` - Lightweight Node.js 20 image
- **Working Directory:** `/app`
- **Dependencies:** Installed via `npm ci`
- **Command:** `npm run dev` (runs `wrangler dev`)

## Troubleshooting

### Bot not responding
- Check that your `.dev.vars` file has correct Discord credentials
- View logs: `docker-compose logs -f discord-bot-cloudflare-ai`

### Port already in use
- Change the host port in docker-compose.yml: `"8788:8787"` (maps host 8788 to container 8787)

### Slow starts
- The volumes for `node_modules` and `.wrangler` are specifically mounted to speed up container restarts
- First start will be slow as dependencies are installed

### Permission issues (Portainer)
- Ensure the host directories exist and have correct permissions
- Check that the user running Docker has access to the Portainer config paths

## Production Deployment

For production deployment to Cloudflare Workers (not Docker):

1. Set your secrets in Cloudflare:
   ```bash
   npx wrangler secret put DISCORD_APPLICATION_ID
   npx wrangler secret put DISCORD_PUBLIC_KEY
   npx wrangler secret put DISCORD_TOKEN
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

The Docker setup is primarily for local development and testing.
