# Simple Docker setup

## 1. Start Docker Desktop

Install Docker Desktop if needed, then open it. Use Linux containers and wait until the Docker engine is running.

## 2. Install the VS Code extension

Open VS Code, press `Ctrl+Shift+X`, and install **Dev Containers** by Microsoft.

## 3. Open the project folder

Select **File → Open Folder** and open:

```text
C:\Users\pilij\Documents\Project\schema-creator\db-schema-visualizer
```

On another PC, open the folder where you copied the project. It must contain `.devcontainer`, `.vscode`, `packages`, `package.json`, and `yarn.lock`.

## 4. Open in Docker

Press `Ctrl+Shift+P` and select:

```text
Dev Containers: Reopen in Container
```

## 5. Wait for automatic setup

Setup installs the development tools and dependencies, then builds the DBML extension. The first run needs internet access and may take several minutes. Wait until setup finishes successfully.

You do not need to install Node.js or Yarn separately on your PC.

## 6. Run the extension

1. Press `Ctrl+Shift+D` to open Run and Debug.
2. Select **Debug DBML Extension** from the dropdown.
3. Press `F5`.
4. In the new **Extension Development Host** window, open your `.dbml` file.
5. Press `Ctrl+Shift+P`, search for **Show diagram**, and run it.

## After making code changes

Save your changes. In the VS Code terminal connected to the container, run:

```bash
cd /workspaces/db-schema-visualizer
yarn --cwd packages/dbml-vs-code-extension build
```

Wait for the build to finish, close the Extension Development Host window, and press `F5` again from the original window.

## If setup fails

Confirm Docker Desktop is running and your internet connection works. In VS Code, open the Command Palette and select **Dev Containers: Rebuild Container** to retry.

For packaging and detailed troubleshooting, see [DOCKER_DEVELOPMENT.md](./DOCKER_DEVELOPMENT.md).
