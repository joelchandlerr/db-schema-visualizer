FROM node:24-bookworm

# VS Code connects as node; sudo is used only to initialize dependency volumes.
RUN apt-get update \
    && apt-get install -y --no-install-recommends sudo \
    && printf 'node ALL=(root) NOPASSWD:ALL\n' > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node \
    && npm install --global --force yarn@1.22.22

WORKDIR /workspaces/db-schema-visualizer
USER node
CMD ["sleep", "infinity"]
