# ZOOM AI Agent - Desktop Client

ZOOM is a native GUI wrapper for a CLI-based AI agent, built with Electron, React, TypeScript, and TailwindCSS. It provides a sleek, modern, and dark-themed interface to interact with your local or remote AI agents.

## Features

- **Full Streaming Chat**: Real-time token streaming with code highlighting and markdown rendering.
- **Provider Agnostic**: Switch between OpenRouter, Anthropic, OpenAI, or Local LLMs (Ollama, LM Studio).
- **Session Management**: Automatically organized chat histories.
- **Profiles & Persona**: Switch between customized agents (Researcher, Creative, Coder).
- **Extensible Skills**: Enable or disable dynamic toolsets (Web Search, File Parser, API Connectors).

## Setup Instructions

1. Ensure you have [Node.js](https://nodejs.org/) (v18+) and npm installed.
2. Clone or download the repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application in development mode:
   *(Note: This fires up both the Vite React dev server and the Electron shell)*
   ```bash
   npm run build && npm run dev
   ```
   *If you are using `electron-vite` directly, you can also run:*
   ```bash
   npx electron-vite dev
   ```

## Production Packaging

To build the distributable binaries (macOS `.dmg`, Linux `.AppImage`/`.deb`, Windows setup):

```bash
npx electron-builder -c electron-builder.yml
```

The output will be generated in the `dist` folder.

## AI Studio Notes
This workspace is heavily optimized to simulate the Electron runtime via a mocked IPC (`window.api`) so that the React UI can be seamlessly previewed inside the AI Studio web container. When you download and run this locally using Electron, the real IPC bridging occurs through `src/main/index.ts` and `src/preload/index.ts`.
