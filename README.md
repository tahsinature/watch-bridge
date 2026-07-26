# WatchBridge

**Decide what to watch — then actually do something about it.**

WatchBridge is a frontend-only app for triaging films and series. Search TMDB,
shortlist and compare the candidates, log what you finished — and wire up your
own buttons to send a title wherever you want it to go. No backend, no account,
no tracking. Everything lives in your browser.

### [→ Try it live](https://tahsinature.github.io/watch-bridge/)

Bring a free [TMDB API key](https://www.themoviedb.org/settings/api); it stays in
your browser.

---

## Features

### Search that ranks honestly

One debounced box searches films and series together, and every result shows its
rating **next to its vote count** — `8.1 (2.4k)`. A 9.5 from four voters stops
looking better than an 8.4 from thirty thousand.

Sort the results by:

| Sort | What it does |
| --- | --- |
| **Most voted** *(default)* | What people actually watched |
| **Relevance** | TMDB's own text-match order |
| **Best rated** | A Bayesian weighted average — the shape IMDb's Top 250 uses — so barely-rated titles regress toward the mean instead of topping the list |
| **Newest / Oldest** | By release date |

Sorting reorders the ~20 results TMDB returned for your query; its search
endpoint has no sort parameter, so it can't rank every match on the site.

The home screen remembers your recent searches and your recently viewed titles
as poster thumbnails — one click to reopen.

### Actions you define

The part that makes it a *bridge*. Every button on a title is data you control:

- **Open URL** — send the title to any site
- **Copy** — put a formatted string on your clipboard
- **Deep link** — hand off to a native app via a custom scheme
- **HTTP request** — GET or POST straight to an endpoint you run

Templates are filled from the selected title with `{placeholders}`:

```
https://1337x.to/search/{titleEncoded}+{year}/1/
https://www.imdb.com/title/{imdbId}/parentalguide
myapp://add?imdb={imdbId}&title={titleEncoded}
```

There's a `{clipboard}` token too, which unlocks flows like *copy a magnet link,
then POST it to your NAS in one click*. Ships with TMDB, IMDb, extto, 1337x,
YouTube, Parents Guide, Letterboxd and Google, plus disabled NAS and deep-link
examples to crib from. Full editor, reorderable, with JSON import/export so a
setup is portable between browsers.

### Everything about a title, in one sheet

Cast, quick facts, overview, IMDb link and embedded trailers — plus a **Where to
watch** matrix comparing streaming, rental and purchase availability across as
many countries as you care to add, with rows highlighted when a service covers
all of them. Posters can be copied to the clipboard or downloaded.

### A content scale that's actually yours

TMDB carries no nudity data, so WatchBridge lets you set a personal **0–3 level**
per title, with a direct link to IMDb's Parents Guide to check. All-ages
certifications pre-fill level 0 automatically. Set a maximum and anything above
it dims out across search and shortlist.

### Shortlist, compare, log

Shortlist anything, put **up to four side by side** to pick a winner, then mark
titles watched with a 1–5 rating and notes. A **Log to Notion** button formats
the entry and opens your page ready to paste.

### Links that survive a refresh

The current tab and open title live in the URL:

```
?view=shortlist
?title=movie-693134
?view=watched&title=tv-1396
```

Refresh restores where you were, browser Back and Forward step through tabs and
opened titles, and any view can be bookmarked. A link opens the *app* rather
than the data — whoever follows it needs their own TMDB key.

### Built for a thumb

On phones the detail view becomes a bottom sheet with a sticky action bar, so
Close, Shortlist and Watched sit in thumb reach instead of in a top corner.

### Local by default

No server, no analytics, no sign-up. Your API key, library, ratings and custom
actions are `localStorage` entries in your own browser, and the only network
requests the app makes are to TMDB.

---

## Run it locally

```bash
bun install
bun run dev      # http://localhost:5173
```

Open **Settings** and paste a TMDB API key (v3 auth) to get started.

```bash
bun run build      # typecheck + production build to dist/
bun run preview    # preview the built app
bun run typecheck  # types only
```

## Deploy your own

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `master`. Set **Settings → Pages → Source** to **GitHub Actions** first —
without it the build succeeds and the deploy step fails with a 404.

Vite's `base` is relative and app state rides in the query string rather than the
path, so the site works from any repo subpath with no server rewrite rules.

## Built with

[Bun](https://bun.sh) · [Vite](https://vite.dev) · React · TypeScript ·
[Tailwind](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) ·
[Zustand](https://zustand.docs.pmnd.rs) ·
[TanStack Query](https://tanstack.com/query) ·
[Framer Motion](https://motion.dev)

Data and images from [TMDB](https://www.themoviedb.org), availability from
JustWatch. This product uses the TMDB API but is not endorsed or certified by
TMDB.
