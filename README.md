# DIRTT navigation prototypes

Three responsive navigation patterns from the *DIRTT Navigation Wires* Figma file, plus the global footer. It's plain HTML, CSS and JS, so there's no build step and nothing to install.

**Live prototype:** <https://celestejhala.github.io/dirtt-nav-prototypes/>

## Run it

Open `index.html` in a browser, or serve the folder with any static host. The live link above is published with GitHub Pages from the `main` branch.

```bash
python3 -m http.server 8000
```

## Patterns

The switcher pill at the bottom of the page changes the pattern. Each pattern also has its own link:

| Pattern | Link | Desktop | Mobile (< 1024px) |
| --- | --- | --- | --- |
| A – Hover – 1 column | `index.html?pattern=hover` | Opens on hover. Top-level items are links, except Resources, which is label-only. | Accordion; the label goes to the page and the chevron expands |
| B – Click – variable column + hover indicator | `index.html?pattern=variable` | Opens on click. The panel fits its content and lines up under its trigger. | Accordion; the whole row expands, and each section starts with a View all link |
| C – Click – full width + hover indicator | `index.html?pattern=full` | Opens on click. The panel spans the full width, and its columns line up with the nav. | Drill-down sub-panels |
| D – Click – variable column, text links + image | `index.html?pattern=textlinks` | B's panel, with every level 2 item as a text link (no cards or tiles) and each View all link paired with a placeholder image. COVE™ sits above Doors. | B's accordion, with search at the top and the buttons fixed to the bottom |

The footer is the same in every pattern. On mobile its three link groups become an accordion that keeps only one section open at a time.

## Editing

- **Copy and menu structure:** `js/nav-data.js`. Every pattern and breakpoint renders from this file.
- **Colours, sizes, spacing and motion timing:** `css/tokens.css`.
- **Shared components:** `css/components.css`. This covers the header, buttons, drawer, accordion and footer.
- **Layouts for each pattern:** `css/patterns.css`.
- **Behaviour:** `js/nav.js`. This covers hover intent, click toggle, panel animation, the drawer, drill-down and accordions.

All motion is turned off for users whose system is set to reduce motion (`prefers-reduced-motion`).
