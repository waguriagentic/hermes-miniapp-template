# Hermes Ops Mini App

Single React SPA for Hermes ops tools.

## Tabs

- Dashboard — iframe proxy to Hermes WebUI via `/dashboard/` → `127.0.0.1:9119`
- CC Generator — API calls via `/ccgen/*` → `127.0.0.1:9122`
  - Generate: `POST /ccgen/generate`
  - Validate: `POST /ccgen/validate`
  - Check BIN: `POST /ccgen/check-bin`
- Video Bypass — API calls via `/video/*` → `127.0.0.1:8888`
  - Resolve: `POST /video/resolve`

## Build

```bash
npm install
npm run build
```

## Caddy

Caddy listens on `:9121` and serves the built SPA from `dist`.

```bash
caddy run --config Caddyfile
```

Routes:

```text
/dashboard/* -> 127.0.0.1:9119
/ccgen/*     -> 127.0.0.1:9122
/video/*     -> 127.0.0.1:8888
/*           -> dist/index.html
```

## Notes

`handle_path` strips the path prefix before forwarding:

- `/ccgen/generate` reaches the CC API as `/generate`
- `/video/resolve` reaches the video API as `/resolve`
- `/dashboard/` reaches Hermes WebUI as `/`

If a backend expects the prefix preserved, replace `handle_path` with `handle` in `Caddyfile`.
