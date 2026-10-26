# Orderflow project

React + Vite + TypeScript operations prototype. Read README.md and DESIGN.md for the product scope and the distinction between demo behavior and production integrations.

## Commands

- `npm run dev`: local Vite app.
- `npm test`: domain tests through the public workflow functions.
- `npm run build`: strict TypeScript checks and production bundle.
- `npm exec -- chrome-devtools-mcp --version`: installed browser tool version.

## Project skills

Skills live in `.agents/skills/`. Read a matching SKILL.md when needed; installing skills does not request running all their workflows.

- `ponytail`: keep changes small, complete, and consistent with existing components.
- `frontend-design`: Anthropic's design skill for building distinctive frontend interfaces. Use for UI design work while respecting the existing prototype, components, and workflow scope.
- `ponytail-review` / `ponytail-audit`: review changes or examine the project for concrete problems.
- `prototype`: explore alternative UI or state designs when requested. Preserve the existing functional prototype unless the user asks to replace it; use disposable experiments for variants.
- `domain-modeling`: clarify orders, stages, readiness, approvals, stock, and delivery terminology.
- `codebase-design`: improve shared interfaces and keep workflow rules separate from rendering.
- `tdd`: use test-first behavior changes when appropriate. Existing domain tests exercise `readiness`, `advanceOrder`, totals, and attention detection.
- `chrome-devtools` / `a11y-debugging`: inspect the real running app, interact with orders, check responsive layouts and accessibility.
- `troubleshooting`: diagnose browser/MCP connection failures.

Superpowers is a separate plugin, pending installation through the Codex plugin catalog. Do not assume its skills or hooks are available until the client confirms them.

## Browser verification

Chrome DevTools MCP is pinned as a dev dependency and configured in `.codex/config.toml`. Launch Codex from this project and load/trust the project configuration. The MCP server uses a temporary isolated Chrome profile. The local Node entry point avoids network downloads at startup.

Check these representative paths when browser tools are available: attention filters, order creation, missing payment proof, a stock shortage and replenishment, packing confirmation, delivery evidence, completion, refresh persistence, modal keyboard focus, and a narrow mobile viewport.

The setup environment could validate the MCP initialize/tools-list handshake but could not launch Chrome or open a Vite port. Do not report browser QA as passed based only on the handshake.

## Scope

Keep the six-stage sequence and guard transitions through `src/lib/workflow.ts`. This project uses fictional data and localStorage. External payments, messaging, warehouse reservation, and delivery booking are outside the prototype. Keep evidence labeled as demo evidence when generated from samples.
