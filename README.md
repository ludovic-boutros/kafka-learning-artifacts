# Artifacts

A collection of self-contained technical pages (interactive walkthroughs, references, runbooks), published with GitHub Pages behind a single menu.

## Layout

```
.
├── index.html                       # top-level menu, built from catalog.js
├── catalog.js                       # list of artifacts shown in the menu
├── README.md
├── .github/
│   ├── workflows/pages.yml          # builds and deploys the whole site
│   └── scripts/check-catalog.js     # validates catalog.js before deploying
└── kafka-kraft-two-dc-partition/    # one folder per artifact
    ├── index.html
    └── README.md
```

| Artifact | Description |
|---|---|
| [kafka-kraft-two-dc-partition](kafka-kraft-two-dc-partition/) | Two-DC KRaft network partition: isolated leader, failover, truncation and split brain |

## Add an artifact

1. Create a folder at the repository root, named in lowercase with hyphens, for example `my-artifact/`.
2. Put the page in `my-artifact/index.html`. Keep it self-contained, or reference assets with relative paths inside the folder. A `README.md` in the folder is optional and isn't published.
3. Optionally add a back link to the menu: `<a href="../">← All artifacts</a>`.
4. Add an entry to `catalog.js`:

   ```js
   {
     path: "my-artifact",
     title: "Short, descriptive title",
     description: "One or two sentences on what it explains.",
     type: "Interactive walkthrough",
     tags: ["Kafka", "Security"],
     updated: "2026-11-05"
   }
   ```

5. Check the catalog with `node .github/scripts/check-catalog.js`, then push to `main`.

The menu sorts entries newest first (by `updated`), and builds its search and tag filter from the catalog automatically. Nothing else needs editing.

## Preview locally

Open `index.html` directly in a browser, or serve the folder so relative links behave exactly as on GitHub Pages:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Deployment

`.github/workflows/pages.yml` runs on every push to `main` and on manual runs from the **Actions** tab. It:

1. validates `catalog.js`: a malformed entry, a duplicate path, or a folder without `index.html` fails the build, and an artifact folder missing from the catalog produces a warning;
2. stages the site: everything except `.git`, `.github` and Markdown files;
3. publishes it to `https://<owner>.github.io/<repo>/`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. If the default branch isn't `main`, change `branches: [main]` in the workflow.

GitHub only runs workflows from `.github/workflows/` at the repository root, so artifact folders must not carry their own workflow.

## License

No license is included yet. Add one (for example MIT or Apache-2.0) before publishing if you want others to reuse these pages.
