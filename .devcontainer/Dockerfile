ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

# Ensure modern package managers (pnpm/yarn) are available globally.
RUN corepack enable

# Install GitKraken CLI so the MCP server is available in the container.
ARG GK_VERSION="3.1.40"
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && curl -fsSL -o /tmp/gk.deb "https://github.com/gitkraken/gk-cli/releases/download/v${GK_VERSION}/gk_${GK_VERSION}_linux_amd64.deb" \
    && apt-get install -y /tmp/gk.deb \
    && rm -f /tmp/gk.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Codex CLI globally for the container.
RUN npm install -g @openai/codex@latest

# Install cline CLI globally for the container.
RUN npm install -g cline

# Install GitHub CLI for repository automation.
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv globally and specify-cli under the unprivileged devcontainer user so it is executable.
ENV UV_INSTALL_DIR=/usr/local/bin \
    UV_TOOL_BIN_DIR=/usr/local/bin
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

ENV UV_TOOL_BIN_DIR=/home/node/.local/bin
USER node
RUN uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
USER root
RUN ln -sf /home/node/.local/share/uv/tools/specify-cli/bin/specify /usr/local/bin/specify \
    && rm -rf /root/.cache/uv
ENV UV_TOOL_BIN_DIR=/home/node/.local/bin
