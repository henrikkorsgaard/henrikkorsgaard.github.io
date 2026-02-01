# henrikkorsgaard.github.io

Personal website for Henrik Korsgaard - henrikkorsgaard.dk

## Local Development

Some pages load data dynamically via JavaScript (e.g., the electricity visualizations). Browsers block local file access for security reasons, so you need to run a local server:

```bash
# From the project root:
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Technology Stack

- Pure HTML5, CSS, vanilla JavaScript
- No build system, no frameworks, no npm dependencies
- External resources: Google Fonts, CDN-hosted libraries (D3.js, Observable Plot)

## Structure

```
├── index.html          # Homepage
├── about.html          # About page
├── notes.html          # Notes index
├── projects.html       # Projects index
├── research.html       # Research/publications
├── notes/              # Individual note pages
├── projects/           # Individual project pages
├── js/                 # JavaScript
│   ├── components.js   # Web components (site menu)
│   └── *.js            # Page-specific scripts
├── style/              # CSS
├── media/              # Images, PDFs, data files
└── planning/           # Planning documents
```

## Git Workflow

- `main` is production (deployed to henrikkorsgaard.dk)
- Feature branches for all work: `feature/<name>`
- All changes go through Pull Requests
