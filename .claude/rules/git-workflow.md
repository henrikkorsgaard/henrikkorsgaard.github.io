# Git Workflow

## Commit Messages
Use conventional commits format:
```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, style, chore

Examples:
- `feat: add projects page with grid layout`
- `fix: correct sidebar link highlighting`
- `style: adjust heading colors for contrast`
- `docs: update planning notes for homepage`

## Branch Strategy
- `main` is production (deployed to henrikkorsgaard.dk)
- Feature branches for all work: `feature/<name>`
- NEVER commit directly to main
- ALL changes go through Pull Requests

## Pull Request Requirements
- Clear title summarizing changes
- Description of what changed and why
- Must be reviewed before merging
