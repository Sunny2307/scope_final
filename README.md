# Scope Frontend (Vite + React)

This is the frontend for Scope, built with Vite and React.

## Getting Started

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```
VITE_API_BASE_URL=https://scope-backend.vercel.app
```

Run locally:

```bash
npm run dev
```

## Building

```bash
cd client
npm run build
```

The production build is emitted to `client/dist`.

## Deploying to Vercel

- The repo root contains `vercel.json` configured for a static Vite build in `client/`.
- Set the environment variable `VITE_API_BASE_URL` in your Vercel project to point at the backend (`https://scope-backend.vercel.app`).
- Vercel build command: `cd client && npm run build`
- Output directory: `client/dist`
- SPA rewrite is configured so client-side routes work on refresh.
