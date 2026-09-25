#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/db-schema-visualizer

# Every path below is a dependency volume declared in devcontainer.json.
# Do not recursively change ownership of the bind-mounted project source.
sudo chown "$(id -u):$(id -g)" \
  node_modules \
  packages/dbml-to-json-table-schema/node_modules \
  packages/dbml-vs-code-extension/node_modules \
  packages/extension-shared/node_modules \
  packages/json-table-schema-visualizer/node_modules \
  packages/prisma-to-json-table-schema/node_modules \
  packages/prisma-vs-code-extension/node_modules \
  packages/shared/node_modules

# Keep the checked-in lockfile and host Git hooks unchanged during setup.
HUSKY=0 yarn install --frozen-lockfile --network-timeout 600000
yarn --cwd packages/dbml-vs-code-extension build
