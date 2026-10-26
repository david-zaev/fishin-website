# FishIn website

The website for [FishIn](https://play.google.com/store/apps/details?id=com.daev.fishin), the Android fishing app: spots on an offline map, hour-by-hour bite forecasts, a catch log, a tackle box and Fish Coach.

Live at **https://fishinapp.site** (GitHub Pages, `main` branch root). Contact: contact@fishinapp.site.

## Pages

| File | What |
|------|------|
| `index.html` | Landing page |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Use |
| `delete-account.html` | How to delete an account (linked from Google Play) |
| `404.html` | Not found |
| `knots/` | 16 knot guides and an index, **generated** by `python tools/build_knots.py` from the app's knot data (edit the script, not the pages) |

All pages share `styles.css` and `script.js`. No build step and no dependencies apart from the Inter font from Google Fonts.

## Design

Black, white and grey only. Inter at in-between weights (440, 456, 652) does the work colour usually does. Pills for anything you can press, 16–24px corners for cards, thin borders instead of shadows. Light and dark themes follow the visitor's system, and the moon/sun button switches between them (remembered in `localStorage`).

When you change `styles.css` or `script.js`, bump the `?v=` on their links in every page so browsers fetch the new file.

## Run locally

```bash
python -m http.server 8765
```

Then open http://localhost:8765.
