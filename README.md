# Hermes Mini App Template

A ready-to-use Telegram Mini App template for Hermes Agent. Fork this and add your own tools.

## Quick Start

```bash
# 1. Clone your fork
git clone https://github.com/waguriagentic/hermes-miniapp-template.git
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

## Navigation Architecture

The app uses a **primary + secondary tab** system:

- **Primary tabs** (shown directly in the bottom bar, max 5): `primaryTabs` array in `src/App.tsx`
- **Secondary tabs** (shown in a "More" bottom sheet): `secondaryTabs` array in `src/App.tsx`

When `secondaryTabs` is empty, the **More** button and sheet are automatically hidden. Add an entry to `secondaryTabs` (with a `desc` field) and the More sheet appears on its own — no other wiring needed.

### Adding a New Tool

1. **Add a Tab union member** in `src/App.tsx`:
   ```ts
   type Tab = 'home' | 'tools' | 'settings' | 'mytool';
   ```

2. **Add to `primaryTabs` or `secondaryTabs`** in `src/App.tsx`:
   ```ts
   // Primary (bottom bar) — max 5
   const primaryTabs: TabDef[] = [
     { id: 'home', label: 'Home', icon: '🏠' },
     { id: 'mytool', label: 'My Tool', icon: '🪄' },
     // ...
   ];

   // — OR — Secondary (More sheet) — unlimited
   const secondaryTabs: TabDef[] = [
     { id: 'mytool', label: 'My Tool', icon: '🪄', desc: 'Does something cool' },
   ];
   ```

3. **Add the page component** in `src/pages/MyTool.tsx`

4. **Add a `case` in `renderPage()`** inside `App.tsx`:
   ```ts
   case 'mytool': return <MyTool />;
   ```

5. **Add the API endpoint** in `server/index.js` (see below)

6. **Rebuild and deploy**

## API Route Pattern

All backend endpoints use the `/api/` prefix. When deploying behind Caddy with `handle_path /app/*`, Caddy strips the `/app` prefix before forwarding, so routes arrive at the server as `/api/...`.

```
Client request:  /app/api/tools/transform
Caddy strips:    /api/tools/transform       (handle_path /app/*)
Server matches:  /api/tools/transform       ✅
```

**Do NOT** use `/app/api/...` in your server routes — they will 404 behind Caddy.

## Architecture

```
├── src/
│   ├── config.ts          # App name, version, API base URL
│   ├── App.tsx            # Root component with tab nav + More sheet
│   ├── App.css            # All styles (CSS variables for theming)
│   ├── pages/
│   │   ├── Home.tsx       # Welcome page with status & quick actions
│   │   ├── Tools.tsx      # Example tool runner (Text Transform, JSON Formatter)
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
    handle_path /app/* {
        reverse_proxy 127.0.0.1:9122
    }
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
