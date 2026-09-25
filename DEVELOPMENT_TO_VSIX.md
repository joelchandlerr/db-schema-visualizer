# Local development → build → VSIX installation

This guide documents the current DBML extension workflow on Windows using PowerShell. It covers working on the source, testing it in VS Code, exporting a local installer, and installing updates.

Repository root:

```text
C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
```

No Git commit, push, pull request, Marketplace account, or publication is needed. Builds use the saved files on disk, including uncommitted changes.

For the initial setup history and earlier troubleshooting, see [LOCAL_SETUP.md](./LOCAL_SETUP.md). Use this guide for the current DBML build and packaging commands; VSIX installation is a separate step from development testing.

## 1. Install dependencies

Prerequisites: Node.js, npm, and desktop VS Code. Internet access is needed to download packages that are not cached.

Run from the repository root:

```powershell
cd C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
npx --yes yarn@1.22.22 install --network-timeout 600000
```

Skip this when dependencies are already installed and have not changed. Yarn workspaces share dependencies across packages; a separate `node_modules` directory inside every package is not required.

Using `npx` avoids requiring a global Yarn installation or `corepack enable`. The latter previously failed because it attempted to write launchers into the protected `C:\Program Files\nodejs` directory.

If registry requests time out, retry with the longer timeout above. The following setting switches Yarn's configured registry to npm, although existing lockfile URLs may still point to the previous registry:

```powershell
npx --yes yarn@1.22.22 config set registry https://registry.npmjs.org
```

This setting can affect other Yarn projects for your user account. Successful installation and a successful build are better checks than simply finding a `node_modules` folder.

## 2. Open the correct folder and customize

```powershell
code -n "C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer"
```

Open the repository folder itself so VS Code loads `.vscode/launch.json`. Opening only a file or the parent `schema-creator` folder does not load this repository's launch configurations automatically.

Useful source locations:

| Location                                               | Purpose                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `packages/json-table-schema-visualizer/src/components` | Shared diagram UI, table notes, toolbar, and zoom controls |
| `packages/extension-shared/src`                        | Shared React webview and schema reception                  |
| `packages/extension-shared/extension`                  | Shared extension host and webview communication            |
| `packages/dbml-to-json-table-schema/src`               | DBML parsing and transformation                            |
| `packages/dbml-vs-code-extension`                      | DBML extension configuration and build setup               |

Save all edits before building. Changing source files alone does not update the already-built extension.

## 3. Build the DBML extension

From the repository root:

```powershell
npx --yes yarn@1.22.22 --cwd packages/dbml-vs-code-extension build
```

This builds the extension host code and webview using Vite, then generates the stylesheet using Tailwind. Outputs include:

```text
packages/dbml-vs-code-extension/dist/extension/index.js
packages/dbml-vs-code-extension/dist/webview/index.html
packages/dbml-vs-code-extension/dist/webview/assets/index.js
packages/dbml-vs-code-extension/dist/webview/assets/index.css
```

Wait for the entire command to finish successfully, including CSS generation. Expected output includes `extension build success` and a completion message such as `Done in 36.64s.` The duration varies between runs. Check the exit status immediately afterward if needed:

```powershell
$LASTEXITCODE
```

Expected: `0`. Existing `dist` files alone do not prove that the latest build succeeded.

## 4. Test in the Extension Development Host

1. Open **Run and Debug** with `Ctrl+Shift+D`.
2. Choose **Debug DBML Extension** from the dropdown.
3. Press `F5`.
4. In the new **Extension Development Host** window, open a `.dbml` file.
5. Press `Ctrl+Shift+P`, search for **Show diagram**, and run it.

The current debug configuration has its broken `yarn: dev` pre-launch task commented out. It loads existing `dist` files and does not automatically rebuild or watch source changes. Rebuild manually, close the development window, and launch again after each change.

The original VS Code window contains your source and controls debugging. The second window runs the local extension. If the installed Marketplace previewer causes confusion, disable that copy while testing.

Example DBML:

```dbml
Table departments {
  id integer [pk, note: 'Unique identifier for the department']
  name varchar [note: 'Name of the department']
  Note: 'Stores department information.'
}

Table employees {
  id integer [pk]
  name varchar
  department_id integer
  Note: 'Stores employee information, including the department assigned to each employee.'
}

Ref: employees.department_id > departments.id
```

Check table and field remarks, relationships, zoom slider, wheel zoom, Fit to View, themes, and export before packaging. Table remarks now appear to the right and use their table header's accent color.

Optional developer checks, run from the repository root:

```powershell
node_modules/.bin/tsc.cmd --noEmit --project packages/json-table-schema-visualizer/tsconfig.json
node --test packages/extension-shared/tests/schema-ready.test.cjs
node_modules/.bin/jest.cmd --config packages/dbml-to-json-table-schema/jest.config.js --runInBand
```

## 5. Export a VSIX installer

Move into the DBML extension package:

```powershell
cd C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer\packages\dbml-vs-code-extension
```

Run:

```powershell
npx --yes --package yarn@1.22.22 --package @vscode/vsce vsce package --no-dependencies
```

What it does:

- Makes Yarn and the VS Code packaging tool available for this command.
- Runs `vscode:prepublish`, which builds the extension and stylesheet.
- Packages the result into a `.vsix` file without uploading it anywhere.
- Uses `--no-dependencies` because this extension's runtime code is bundled by Vite; workspace dependency folders do not need to be packaged. Revisit this if future code adds unbundled runtime dependencies.

The command may download tools or ask packaging questions. Address any reported packaging errors and wait for a success message before using the output. A successful Vite build does not by itself mean VSIX packaging succeeded.

With the current package name and version, the expected output is:

```text
packages/dbml-vs-code-extension/dbml-erd-visualizer-0.8.0.vsix
```

Find the output from the extension directory:

```powershell
Get-ChildItem -Filter *.vsix
```

Check the timestamp so you install the newly generated file rather than an older package.

## 6. Install in normal VS Code

Use your regular VS Code window:

1. Open Extensions with `Ctrl+Shift+X`.
2. Open the **More Actions** menu using the three-dot button at the top of the Extensions panel.
3. Select **Install from VSIX**.
4. Choose the generated `.vsix` file.
5. Reload or restart VS Code if prompted, and ensure the extension is enabled.

Alternatively, from the extension directory:

```powershell
code --install-extension .\dbml-erd-visualizer-0.8.0.vsix
```

Now open a `.dbml` file and run **Show diagram**. No `F5`, source checkout, or development host is needed for normal use of the installed package.

The package retains the identity `bocovo.dbml-erd-visualizer`. Installing it updates/replaces the extension with that identity; it does not create a separately named personal extension. Disable automatic updates for this extension if you want to prevent a Marketplace update from replacing your custom version.

## 7. Update or share the local installer

For subsequent changes:

1. Edit and save source files.
2. Build and test in the development host.
3. Run the packaging command again from the extension directory.
4. Reinstall the new `.vsix` in normal VS Code.

If the same version is already installed, use:

```powershell
code --install-extension .\dbml-erd-visualizer-0.8.0.vsix --force
```

This intentionally replaces the installed copy. You can increment `version` in the extension's `package.json` to distinguish releases; the generated filename changes accordingly. Keep an older VSIX if you want a rollback copy.

You can rename the exported file, for example to `my-schema-visualizer.vsix`, or copy it to another computer. Keep the `.vsix` suffix. Renaming the file does not change the installed display name, publisher, internal identity, or version.

When sharing a copy, retain the project's license and copyright notice. Packaging and installation do not require a Git commit or push.

## Troubleshooting from this setup

### Packaging failed with `EINVALIDPACKAGENAME`

The outer command supplied both Yarn and VSCE through `npx`. The build then ran another `npx`, which received a malformed inherited package list. The failure appeared at `npx vite build` and mentioned a package name containing both Yarn and VSCE.

We removed the nested `npx` calls in `packages/dbml-vs-code-extension/package.json`. The current scripts are:

```json
"build": "vite build && yarn run generate:css",
"generate:css": "cd ../json-table-schema-visualizer && tailwindcss -i ./src/styles/index.css >  ../dbml-vs-code-extension/dist/webview/assets/index.css --minify"
```

Yarn scripts already expose the installed local executables. Do not reintroduce `npx` here to resolve a missing-tool error; confirm dependency installation instead.

### `Could not find the task 'yarn: dev'`

The original launch configuration referred to a task/script that did not exist. Its `preLaunchTask` is now commented out. Build manually, then run **Debug DBML Extension**.

### VS Code offers to debug Markdown

Open the repository root as a folder and select the named extension configuration in Run and Debug. Do not create a Markdown debugging configuration.

### Blank preview with a React `useState` error

The workspace previously bundled multiple React copies. The DBML Vite configuration now includes:

```js
resolve: {
  dedupe: ['react', 'react-dom'],
}
```

Preserve this setting. Rebuild and restart the development host after changing it.

### `No schema found` on initial opening

The extension previously sent the initial schema before the webview listener was ready. The shared code now uses a `WEBVIEW_READY` handshake and resends the current document when the preview loads or reloads. Rebuild both sides and restart the host; for an installed extension, repackage and reinstall as well.

### Changes are missing after editing

Check which copy you are running: source, compiled development output, and installed VSIX are distinct. Rebuild for `F5` testing; repackage and reinstall for normal VS Code usage. Save files before either workflow.

### Build warnings

Messages about Vite's CJS API, large chunks, Browserslist, or npm configuration keys were non-blocking in our successful builds. A missing-license-field warning refers to package metadata and does not mean the root repository lacks a license. Read the final exit status and any explicit `ERROR` output to determine whether the command succeeded.

For runtime errors, open **Developer: Toggle Developer Tools** in the development host and inspect Console. Also inspect Debug Console in the original VS Code window.
