# WatchBridge

A frontend-only movie/series triage app. Search a title → get poster, IMDB link,
a bullet breakdown, and trailers → fire your own configurable actions (torrent
search, send-to-NAS, open a native app, log to Notion). No backend. State lives in
your browser's `localStorage`.

Built with **Bun · Vite · React · TypeScript · Tailwind · shadcn/ui · Framer Motion**.

**Design:** terminal-brutalist — JetBrains Mono throughout, zero border radius,
near-black surfaces with hairline borders, coral accent (cyan for cross-country
availability, amber for star ratings). Tokens live in `src/index.css`.

## Quick start

```bash
bun install
bun run dev      # http://localhost:5173
```

On first run, open **Settings** and paste a free **TMDB API key** (v3 auth).
Get one at https://www.themoviedb.org/settings/api. The key is stored locally and
never sent anywhere except TMDB.

```bash
bun run build      # typecheck + production build to dist/
bun run preview    # preview the built app
bun run typecheck  # types only
```

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes `dist/` to Pages. The Vite
`base` is `./` (relative), so the app works from any repo path without edits.

> **Note:** a GitHub repo can host only **one** Pages site. If WatchBridge lives
> inside a monorepo alongside other Pages projects, either (a) give it its own
> repo, or (b) publish it to a subfolder of a single Pages site and adjust the
> workflow's upload path. See the comment at the top of the workflow file.

## Features

- **Search** movies & series in one box (TMDB multi-search), debounced.
- **Rich detail** — poster (copy/download), quick facts, overview, cast, IMDb link,
  and multiple embedded YouTube trailers.
- **Configurable actions** — data-driven buttons (open-url / copy / deep-link /
  http-request) with `{placeholder}` templates including `{clipboard}`. Seeded
  defaults (extto, 1337x, IMDb, YouTube, Letterboxd, Google), full editor, and
  JSON import/export.
- **Library** — shortlist titles, **compare** them side by side, mark **watched**
  with a 1–5 rating and notes, and **log to Notion**.

## Project layout

```
src/
  components/ui/         shadcn primitives (button, dialog, tabs, select, …)
  components/search/     search box, results grid, cards
  components/detail/     detail modal, trailers, quick facts, cast
  components/actions/    action bar + editor (configurable actions)
  components/library/    shortlist, compare, watched log
  stores/                zustand + persist (settings, actions, library, toast)
  lib/                   tmdb client, placeholders, runAction, notion, helpers
  hooks/                 useTmdb, useDebounce
```
