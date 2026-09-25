# Simple steps to commit and push to your fork

## 1. Open the project

In Windows PowerShell:

```powershell
cd C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
```

If using the Docker development terminal instead:

```bash
cd /workspaces/db-schema-visualizer
```

The Git commands below work in either terminal.

## 2. Check your branch, destination, and changes

```bash
git branch --show-current
git remote -v
git status
git diff
git diff --cached
```

At the time this guide was written, the branch was `main` and `origin` pointed to your fork:

```text
https://github.com/joelchandlerr/db-schema-visualizer.git
```

Confirm these still match before using the push command below. Pushing to this origin updates your fork; it does not submit a pull request or change the original developer's repository.

`git diff` shows unstaged edits. `git diff --cached` shows changes already staged for the next commit. Save your files and review both before continuing.

## 3. Stage your changes

To stage all intended changes after reviewing them:

```bash
git add .
git diff --cached --stat
```

Only use `git add .` when you want to include all non-ignored changes in this folder. Check that you are not including secrets, unrelated edits, or generated installers.

To select individual files instead, name them explicitly. For example, to stage the pre-commit fixes:

```bash
git add .husky/pre-commit .lintstagedrc.js
```

## 4. Commit normally

```bash
git commit -m "Added new feature"
```

Choose a message describing your actual changes. The pre-commit hook runs the project's checks and formatting. Wait for the command to finish successfully.

We previously used this bypass:

```bash
git commit --no-verify -m "added new feat"
```

It skipped the hooks. It is no longer needed for the `yarn: command not found` error because we changed:

| File                | Previous command          | Current command      |
| ------------------- | ------------------------- | -------------------- |
| `.husky/pre-commit` | `yarn lint-staged`        | `lint-staged`        |
| `.lintstagedrc.js`  | `yarn tsc-files --noEmit` | `tsc-files --noEmit` |

Husky adds `node_modules/.bin` to PATH, so these commands use locally installed tools. ESLint and TypeScript errors can still block a commit; fix any reported errors, stage the corrected files, and commit again normally.

## 5. Push to your fork

For the `main` branch checked in step 2:

```bash
git push -u origin main
```

Complete GitHub authentication if prompted. If the branch is different, use that branch name instead of `main`.

If Git rejects the push because the remote contains newer commits, stop and review those changes before merging or rebasing. Do not use a force push as a routine fix.

## 6. Verify

```bash
git status
git log -1 --oneline
```

Open your [GitHub fork](https://github.com/joelchandlerr/db-schema-visualizer) and confirm the new commit appears on the correct branch.

## If commit tools are missing

Install the project dependencies from the repository root.

On Windows:

```powershell
npx --yes yarn@1.22.22 install --network-timeout 600000
```

Inside the Docker development container:

```bash
HUSKY=0 yarn install --network-timeout 600000
```

The Docker command skips hook installation during dependency setup, as configured for this project. It does not permanently disable existing commit hooks. When committing from Windows, Windows dependencies must be installed; container dependency volumes are separate.

Building and exporting a VSIX do not require a commit or push. Follow this guide when you want to save changes in Git history and upload them to your fork.
