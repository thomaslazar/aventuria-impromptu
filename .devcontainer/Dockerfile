ARG VARIANT="20-bullseye"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

# Ensure modern package managers (pnpm/yarn) are available globally.
RUN corepack enable

# Install GitKraken CLI so the MCP server is available in the container.
ARG GK_VERSION="3.1.40"
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL -o /tmp/gk.deb "https://github.com/gitkraken/gk-cli/releases/download/v${GK_VERSION}/gk_${GK_VERSION}_linux_amd64.deb" \
    && apt-get install -y /tmp/gk.deb \
    && rm -f /tmp/gk.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
