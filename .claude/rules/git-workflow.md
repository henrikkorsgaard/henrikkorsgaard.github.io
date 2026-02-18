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

## Remote Operations

- ALWAYS use the `gh` CLI for remote git operations (push, pull, fetch, etc.)
- Use the `henrikkorsgaard` GitHub account
- NEVER use SSH-based git commands for remote operations (they require passphrase input)
- Example: `gh repo sync` or pull via HTTPS with gh auth

## Pull Request Requirements

- Clear title summarizing changes
- Description of what changed and why
- Must be reviewed before merging
