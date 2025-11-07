# UFC: Two Per Division

Static fan mini-site highlighting the top two contenders in every UFC division. Built from a dark-themed redesign of the Tidy HTML template with data-driven overlays, responsive grids, and auto-generated fighter spotlight pages.

## Project structure

```
.
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── styles.min.css
│   ├── img/
│   │   ├── divisions/
│   │   └── fighters/
│   └── js/
│       ├── main.js
│       ├── main.min.js
│       ├── roster.js
│       └── roster.min.js
├── fighters/              # Auto-generated fighter pages
├── scripts/               # Utility scripts (generation + minification)
├── index.html
├── divisions.html
├── about.html
├── 404.html
└── package.json
```

## Getting started

```bash
npm install
```

### Generate fighter pages

```bash
npm run generate:fighters
```

Reads `assets/js/roster.js` and rebuilds every file in `fighters/`.

### Minify CSS & JS

```bash
npm run build:assets
```

Creates `styles.min.css`, `main.min.js`, and `roster.min.js`. The HTML pages reference the minified output.

### Full build

```bash
npm run build
```

Runs the generator and then minifies assets.

## Updating the roster

1. Edit `assets/js/roster.js` (keep the `export const ROSTER = { ... }` structure).
2. Add/remove placeholder images in `assets/img/fighters/` as needed (WebP).
3. Run `npm run build` to regenerate fighter pages and refresh minified assets.

Division cards, quick-browse modals, and featured fighters update automatically on the front end using the roster data.