# Local Development Setup: DB Schema Visualizer

This document records how to run and customize the DB Schema Visualizer VS Code extension locally without publishing it to the VS Code Marketplace or contributing changes to the original project.

## Project location

The local working copy is:

```text
C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
```

The repository contains two extensions:

- `packages/dbml-vs-code-extension` — visualizes `.dbml` files
- `packages/prisma-vs-code-extension` — visualizes `.prisma` files

The DBML extension was used for this setup guide.

## What runs locally

There are two local workflows:

1. **Extension Development Host**: runs the extension from the local source/build output for development and testing.
2. **VSIX installation**: packages the extension into a `.vsix` file that can be installed into the normal VS Code environment.

Neither workflow publishes the extension or sends changes to the original repository.

## Prerequisites

Install the following:

- Visual Studio Code
- Node.js and npm
- Git, if cloning or managing the repository through Git

The project uses Yarn 1. The repository has a `yarn.lock` file and uses Yarn workspaces.

## Install dependencies

Open PowerShell at the repository root:

```powershell
cd C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
```

The normal command would be:

```powershell
yarn install
```

However, Yarn was not initially available as a command. The project was installed using Yarn through `npx` instead:

```powershell
npx --yes yarn@1.22.22 install
```

This downloads and runs Yarn 1.22.22 without requiring a permanent global Yarn installation.

After a successful installation, the repository root should contain a `node_modules` directory:

```powershell
Test-Path node_modules
```

Expected result:

```text
True
```

Because this is a Yarn workspace, dependencies may be hoisted into the root `node_modules`. It is not required for every package directory to have its own `node_modules` directory.

## Why `corepack enable` failed

Node.js includes Corepack, which can manage package-manager commands such as Yarn and pnpm. The command:

```powershell
corepack enable
```

tries to create command shims such as:

```text
C:\Program Files\nodejs\yarn
C:\Program Files\nodejs\yarnpkg
```

On Windows, `C:\Program Files\nodejs` is protected. The command failed with:

```text
EPERM: operation not permitted
```

This was a permissions issue, not a problem with the project. Running PowerShell as Administrator could allow Corepack to create those files, but it was unnecessary. The project instead uses:

```powershell
npx --yes yarn@1.22.22 install
```

This avoids modifying the protected Node.js installation directory.

## Network timeout during installation

The first dependency installation timed out while downloading `rxjs`:

```text
https://registry.yarnpkg.com/rxjs/-/rxjs-7.8.2.tgz: ESOCKETTIMEDOUT
```

This indicates that Yarn could not complete the network request. It does not indicate a source-code failure.

The Yarn registry was changed to the npm registry and the network timeout was increased:

```powershell
npx --yes yarn@1.22.22 config set registry https://registry.npmjs.org
npx --yes yarn@1.22.22 install --network-timeout 600000
```

Then verify that installation completed:

```powershell
Test-Path node_modules
```

The command should return `True`. A successful installation normally ends with output similar to:

```text
success Saved lockfile.
Done in 36.64s.
```

If the command continues retrying, stop it with `Ctrl+C`, check the network/VPN/firewall, and run the install command again.

## Open the correct VS Code folder

Open the repository folder itself, not an individual file and not its parent folder:

```powershell
code -n "C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer"
```

The VS Code Explorer should show these top-level items:

```text
.vscode
packages
assets
package.json
README.md
yarn.lock
```

Opening only a Markdown file, `launch.json`, or the parent `schema-creator` folder prevents VS Code from loading the repository's debug configurations.

## Build the DBML extension

From the repository root, run:

```powershell
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension build
```

The build performs two operations:

1. Builds the extension and webview with Vite.
2. Generates the Tailwind CSS file used by the webview.

Successful output includes messages similar to:

```text
extension build success
Done in 36.64s.
```

Verify the build output:

```powershell
Test-Path packages\dbml-vs-code-extension\dist
```

Expected result:

```text
True
```

Warnings about an outdated Browserslist database, large JavaScript chunks, npm configuration keys, or Vite's CJS API are non-blocking unless the command exits with an error.

## Start the local extension

The repository contains `.vscode\launch.json` configurations. Use the **Run and Debug** panel in VS Code.

For the DBML extension, choose:

```text
Debug DBML Extension
```

Then press the green Start button or `F5`.

VS Code opens a second window called the **Extension Development Host**. This is a temporary test VS Code window where the local extension is loaded.

In the Extension Development Host:

1. Open a `.dbml` file.
2. Press `Ctrl+Shift+P`.
3. Search for `Show diagram`.
4. Run the DBML diagram command.

The source package defines the command internally as:

```text
dbml-erd-visualizer.previewDiagrams
```

Its visible title is `Show diagram`.

The preview can also be opened from the editor title toolbar when a `.dbml` file is active.

## Debug configuration issue: missing `yarn dev`

The original `.vscode\launch.json` contained this pre-launch task for `Debug DBML Extension`:

```json
"preLaunchTask": "yarn: dev"
```

However, `packages/dbml-vs-code-extension\package.json` does not define a `dev` script. Pressing `F5` therefore produced:

```text
Could not find the task 'yarn: dev'.
```

The extension had already been built manually, so the `preLaunchTask` line was removed from the `Debug DBML Extension` configuration. After saving `.vscode\launch.json`, `F5` could launch the local extension using the existing `dist` output.

Another option is to use the repository's **Preview DBML Extension** configuration, which invokes the build task instead of the missing watch task. Manual building is still reliable when using Yarn through `npx`.

## Blank diagram preview and React error

Initially, the preview panel opened but appeared blank. The webview developer console showed:

```text
TypeError: Cannot read properties of null (reading 'useState')
```

This is the typical React invalid-hook error caused by multiple React instances being bundled. The workspace imports React-based source from another package, so Vite could resolve more than one copy of `react` or `react-dom`.

The fix was added to:

```text
packages/dbml-vs-code-extension/vite.config.js
```

The Vite configuration now contains:

```js
resolve: {
  dedupe: ['react', 'react-dom'],
},
```

This forces the webview to use one shared React instance. Rebuild after changing this file:

```powershell
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension build
```

Then close the current Extension Development Host window, press `F5` again, and reopen the diagram.

## Testing DBML input

Use a complete sample such as:

```dbml
Table departments {
  id integer [pk]
  name varchar
}

Table employees {
  id integer [pk]
  name varchar
  department_id integer
}

Ref: employees.department_id > departments.id
```

Save the file with `Ctrl+S`, then run **Show diagram**. The extension updates the preview when the active DBML document changes.

## Avoid conflicts with the Marketplace extension

If the regular VS Code installation already has the Marketplace DBML previewer installed, disable it while testing the local version:

1. Open Extensions with `Ctrl+Shift+X`.
2. Find the installed DBML previewer.
3. Open its gear menu.
4. Choose **Disable** or **Disable (Workspace)**.

This prevents duplicate DBML language support or command registrations from making it unclear which extension is being tested. The Extension Development Host normally isolates development extensions, but disabling the Marketplace copy avoids confusion.

## Inspect errors

If the preview is blank or the command does not work:

1. In the Extension Development Host, press `Ctrl+Shift+P`.
2. Run **Developer: Toggle Developer Tools**.
3. Open the **Console** tab and look for red errors.
4. Check the **Debug Console** in the original VS Code window for extension-host errors.

The following messages are generally unrelated to this extension:

- `fonts.ts:32 Failed to query fonts: SecurityError: Page needs to be visible`
- `Unrecognized feature: 'local-network-access'`
- sandbox warnings from VS Code webviews
- outdated Browserslist notifications
- Node.js `url.parse()` deprecation warnings

The important error in the blank-preview case was the React `useState` failure, which was fixed through Vite React deduplication.

## Package and install a local VSIX

When the customization is ready, create a local VS Code extension package:

```powershell
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension create:package
```

This creates a `.vsix` file in:

```text
packages\dbml-vs-code-extension
```

Install it through VS Code:

```text
Extensions → More Actions menu → Install from VSIX
```

Or from PowerShell, using the generated filename:

```powershell
code --install-extension .\packages\dbml-vs-code-extension\dbml-erd-visualizer-0.8.0.vsix
```

The version in the filename may change if `package.json` is updated.

After rebuilding a new VSIX, reinstall it to replace the previous local copy.

## Prisma extension

The same approach applies to Prisma:

```powershell
npx --yes yarn@1.22.22 --cwd packages/prisma-vs-code-extension build
npx --yes yarn@1.22.22 --cwd packages/prisma-vs-code-extension create:package
```

Use the **Preview Prisma Extension** launch configuration and open a `.prisma` file in the Extension Development Host.

## Personal-use and licensing notes

The repository includes an MIT license. For local personal customization, no Marketplace publication or contribution is required. If the modified extension is redistributed, retain the original license and copyright notice as required by the license.

## Recommended repeatable workflow

For normal development:

```powershell
cd C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
npx --yes yarn@1.22.22 install
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension build
code -n "C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer"
```

Then press `F5`, launch the local DBML extension, and test in the Extension Development Host.

For a normal local installation:

```powershell
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension build
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension create:package
```

Install the generated `.vsix` through the VS Code Extensions menu.
