# March Mania

A live March Madness ownership board built with Vue 3, Vite, and Vuetify.

It pulls the current NCAA tournament bracket, maps teams to owners from `owners.json`, shows live scores in the bracket, and calculates winnings based on the pool rules.

## Features

- Live bracket layout inspired by the NCAA tournament board
- Owner chips shown next to each team
- Rotating owner leaderboard with pin-to-top support
- Automatic refresh every 10 seconds
- Reusable yearly setup by swapping in a new `src/data/owners.json`
- Vercel-ready static deployment with an external API rewrite

## Payout Rules

- Each team costs `$7`
- `$2` per team goes into the championship pot
- Each game win pays back `$3`
- Final Four losers get `$7`
- Runner-up gets `$14`
- Champion gets `$100`

## Local Development

```bash
npm install
npm run dev
```

The app uses a local Vite proxy for `/api/ncaa/*` during development.

## Production / Vercel

This repo is configured for static deployment on Vercel.

- The frontend requests `/api/ncaa/*`
- `vercel.json` rewrites that path to `https://ncaa-api.henrygd.me/*`
- No custom backend or serverless function is required

## Reusing Next Year

1. Replace `src/data/owners.json` with the new owner/team assignments.
2. Deploy with a new year using `?year=2027`, or set `VITE_MARCH_MADNESS_YEAR`.
3. Optionally adjust polling with `VITE_MARCH_MADNESS_POLL_MS`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
