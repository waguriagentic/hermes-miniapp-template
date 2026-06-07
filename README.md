# Hermes Mini App Template

A ready-to-use Telegram Mini App template for Hermes Agent. Fork this and add your own tools.

## Quick Start

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/hermes-miniapp-template.git
cd hermes-miniapp-template

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Configure environment
cp .env.example .env

# 4. Build the frontend
npm run build

# 5. Start the server
node server/index.js
```

Open `http://localhost:9122` in your browser to preview.

## Adding Your Own Tools

1. **Create a new page** in `src/pages/` (e.g. `src/pages/MyTool.tsx`)
2. **Add the tab** in `src/config.ts`
3. **Add the API endpoint** in `server/index.js`
4. **Rebuild and deploy**

## Architecture

```
├── src/
│   ├── config.ts          # Tabs, app name, API base URL
│   ├── App.tsx            # Root component with tab navigation
│   ├── App.css            # All styles (CSS variables for theming)
│   ├── pages/
│   │   ├── Home.tsx       # Welcome page with status & quick actions
│   │   ├── Tools.tsx      # Tool runner (Text Transform, JSON Formatter)
│   │   └── Settings.tsx   # API config, theme toggle, about
│   ├── components/
│   │   └── Toast.tsx      # Toast notification system
│   └── lib/
│       └── api.ts         # Fetch wrapper with configurable base URL
├── server/
│   ├── index.js           # Express API server + static file serving
│   └── package.json
├── .env.example
└── index.html
```

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Express (serves both API and static files from one process)

## Deployment

### With Cloudflare Tunnel
```bash
cloudflared tunnel --url http://localhost:9122
```

### With Caddy (reverse proxy)
```caddyfile
your-domain.com {
    reverse_proxy 127.0.0.1:9122
}
```

### With Nginx
```nginx
server {
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:9122;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Connect to Telegram Bot
1. Open [@BotFather](https://t.me/BotFather)
2. Select your bot → **Bot Settings** → **Menu Button** → **Configure**
3. Set URL to your deployed HTTPS URL

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `9122` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |

## Development

```bash
# Terminal 1: start API server
cd server && node index.js

# Terminal 2: start Vite dev server (proxies /api to backend)
npm run dev
```

## License

MIT
