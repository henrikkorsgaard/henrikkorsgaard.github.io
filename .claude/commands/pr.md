---
description: "Create a Pull Request for current branch"
---

Follow these steps:

1. Run `git status` to check current state
2. If there are uncommitted changes, ask if they should be committed first
3. Check if on main branch - if so, create a feature branch:
   - Ask user for branch name or suggest one based on changes
   - Run `git checkout -b feature/<name>`
4. Run `git log main..HEAD --oneline` to see commits to include
5. Run `git diff main...HEAD --stat` to see files changed
6. Create PR using `gh pr create` which handles pushing automatically:

   ```
   gh pr create --fill-first
   ```

   Or with explicit title/body:

   ```
   gh pr create \
     --title "Title here" \
     --body "Description here"
   ```

   The description should include:
   - What changed
   - Why it changed
   - Any notes for review

Note: `gh pr create` pushes the branch automatically via HTTPS (no SSH passphrase needed).

If any step fails, stop and report the issue.
