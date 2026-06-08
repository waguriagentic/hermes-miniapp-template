# Hermes Ops Mini App

Single React SPA for Hermes ops tools.

## Tabs

- Hermes Dashboard — iframe proxy via `/dashboard/` → `127.0.0.1:9119`
- 9Router — local iframe via `/9router/` → `127.0.0.1:20128`, plus public link `https://jackowi.empty.codes/`
- Airdrop Ops — quick command panel for Tavily, Modal volume, and Mimo progress
- NFT Minter — prepare-only mint panel; no transaction is sent from the mini app
- Wallet Tools — explorer/revoke/DeBank shortcuts for EVM/Solana addresses
- CC Generator — API calls via `/ccgen/*` → `127.0.0.1:9122`
  - Generate: `POST /ccgen/generate`
  - Validate: `POST /ccgen/validate`
  - Check BIN: `POST /ccgen/check-bin`
- Video Bypass — API calls via `/video/*` → `127.0.0.1:8888`
  - Resolve: `POST /video/resolve`
- Quick Links — common dashboards and tools

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
/9router/*   -> 127.0.0.1:20128
/ccgen/*     -> 127.0.0.1:9122
/video/*     -> 127.0.0.1:8888
/*           -> dist/index.html
```

## Notes

`handle_path` strips the path prefix before forwarding:

- `/dashboard/` reaches Hermes WebUI as `/`
- `/9router/dashboard/endpoint` reaches 9Router as `/dashboard/endpoint`
- `/ccgen/generate` reaches the CC API as `/generate`
- `/video/resolve` reaches the video API as `/resolve`

If a backend expects the prefix preserved, replace `handle_path` with `handle` in `Caddyfile`.

NFT Minter is prepare-only by design. Real mint/send transactions require explicit confirmation and should use a burner wallet.
