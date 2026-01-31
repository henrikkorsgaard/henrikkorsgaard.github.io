---
description: "Create a Pull Request for current branch"
---

Follow these steps:

1. Run `git status` to check current state
2. If there are uncommitted changes, ask if they should be committed first
3. Run `git log main..HEAD --oneline` to see commits to include
4. Run `git diff main...HEAD --stat` to see files changed
5. Push branch to remote: `git push -u origin $(git branch --show-current)`
6. Create PR using `gh pr create` with:
   - Title: Clear summary of the changes
   - Description including:
     - What changed
     - Why it changed
     - Any notes for review

If any step fails, stop and report the issue.
