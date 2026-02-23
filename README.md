# OffStash+

A personal offline-first Progressive Web App for stashing guides, recipes, notes, and more.

## Files

```
offstash/
├── index.html      ← Main app (all UI + logic)
├── sw.js           ← Service worker (offline caching)
├── manifest.json   ← PWA manifest
├── icon-192.svg    ← App icon 192px
├── icon-512.svg    ← App icon 512px
└── README.md
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Visit `https://yourusername.github.io/offstash/`
5. On iPhone/Android: **Share → Add to Home Screen** to install as PWA

## Features

- **100% offline** after first load via service worker cache
- **IndexedDB** storage for all entries (no size limits)
- **4 categories**: Business/Finance, Recipes/Cooking, Personal Notes, Other
- **Fuzzy search** across titles, content, tags, summaries
- **Export/Import JSON** for backups and sync
- **Dark mode** default, mobile-optimized with safe areas
- **Installable PWA** — standalone app on iOS/Android
