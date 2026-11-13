# Paceboard

Paceboard is a responsive, local-first project manager. It is a complete replacement for this repository's earlier unrecoverable checkout, which contained `client` and `server` gitlink pointers without submodule URLs.

## Features

- Responsive overview with task, completion and upcoming-deadline summaries
- Project creation, editing, archiving, restoring, and deletion
- Task creation, editing, deletion, priorities, owners, notes, due dates, and status
- Four-stage drag-and-drop Kanban with accessible non-drag controls
- Searchable task list, project and priority filters, project progress, upcoming timeline, and activity
- Light/dark theme and keyboard shortcuts (`/` for search, `n` to create a task)
- Validated JSON backup and restore, local persistence, sample workspace, and a reset action
- No user account, external database, API key, or runtime dependency

**Important:** All task data is stored in **this browser's localStorage**. It does not sync across devices or support shared multiuser collaboration. Download a backup regularly, especially before clearing browser data. The initial sample workspace is demonstration content only. Imported data is checked before it replaces existing data, and the UI escapes user-provided text before rendering.

## Local development

Node.js 20+ is required for tests and builds. You can also serve the repository with any static server (ES modules require HTTP rather than opening `index.html` as a `file://` page).

```bash
npm test
npm run check
npm run build
python3 -m http.server 8000
```

Open http://localhost:8000. `npm run build` emits the production static site in `dist/`. No `npm install` is required.

## Publish on GitHub Pages

The `Publish Paceboard` Actions workflow runs after a push to `main`, builds and tests the site, and uploads the static assets to GitHub Pages.

**One-time repository setting:** If Pages is not yet enabled, an administrator must open **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then select **Actions → Publish Paceboard → Run workflow** (or push again). The workflow's default GitHub token cannot enable Pages automatically on an unconfigured repository.

Once the deployment succeeds, the public address is:

https://wiilki.github.io/project-management-app/

The workflow reports the exact deployed URL. Do not treat the URL as live until that run succeeds.

## Architecture

- `index.html` — semantic shell and accessible icon sprite
- `styles.css` — responsive design system, light/dark themes
- `src/model.js` — validated local-first data operations and metrics
- `src/app.js` — rendering, forms, filters, navigation, drag/drop, backup handling
- `tests/model.test.js` — automated domain and data-validation regression tests
- `scripts/build.mjs` — dependency-free production build

There are no runtime network requests to project services; Google Fonts is optional visual enhancement with local/system fallbacks. Older backend code was not available from the repository's gitlink entries and has **not** been represented as operational.
