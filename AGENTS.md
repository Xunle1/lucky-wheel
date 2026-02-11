# Repository Guidelines

## Project Structure & Module Organization
This repository is a lightweight static web app (no framework or bundler).

- `index.html`: app shell and slot-machine markup.
- `style.css`: pixel-art theme, layout, and animation styles.
- `script.js`: spinner logic, lever interaction, and audio synthesis.
- `config.js`: customizable `DRINKS` data source (HTML snippets rendered in the UI).
- `README.md`: end-user setup and deployment notes.

Keep new files near the root unless a clear folder structure is introduced (for example, `assets/` for media files).

## Build, Test, and Development Commands
There is no build step. Run locally with a static server:

- `python3 -m http.server 8000` — serves the app at `http://localhost:8000`.
- `open index.html` — quick manual preview (audio may be blocked by browser policies).

For deployment, push to `main` (GitHub Pages workflow is expected by the project README).

## Coding Style & Naming Conventions
- Use existing formatting style per file: 4-space indentation in `index.html`/`script.js`, 2-space indentation in `style.css`.
- JavaScript: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants (for example, `REPEAT_COUNT`).
- CSS: kebab-case class names (for example, `.spinner-window`, `.winner-pulse`).
- Prefer descriptive names tied to UI behavior (`startSpin`, `finishSpin`, `resultDisplay`).

Keep logic simple and DOM-oriented; avoid adding heavy dependencies for small features.

## Testing Guidelines
No automated test suite is configured yet. Validate changes with manual smoke tests:

- Start server and load the page in a desktop and mobile-sized viewport.
- Pull the lever repeatedly; verify smooth spin, winner highlight, and result text.
- Confirm audio behavior after first user interaction.
- If `config.js` is edited, verify all drink entries render correctly.

## Commit & Pull Request Guidelines
Follow the commit style seen in history:

- Format: `<Type>: <short summary>`
- Common types: `Fix`, `Update`, `Optimize`, `Initial commit`
- Example: `Fix: Precise item alignment using dynamic height calculation`

PRs should include: purpose, key UI changes, manual test notes, and screenshots/GIFs for visual updates.

## Security & Configuration Tips
`config.js` entries are injected with `innerHTML`; treat content as trusted-only. Do not include untrusted user input without sanitization.
