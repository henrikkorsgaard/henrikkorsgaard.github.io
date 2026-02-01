# Claude Code Context

## Local Development

Pages that load data dynamically (e.g., visualizations) require a local server due to browser CORS restrictions on `file://` URLs.

```bash
# From the project root:
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Technology Constraints

- Pure HTML5, CSS, vanilla JavaScript only
- NO build systems, NO frameworks, NO npm/node dependencies
- External resources limited to CDN-hosted fonts and libraries
- Keep it simple and maintainable

## Content Rules

- NEVER write blog posts, notes, or project descriptions for Henrik
- You may help with HTML/CSS/JS implementation, planning, and structuring
- Planning documents go in `/planning` folder
