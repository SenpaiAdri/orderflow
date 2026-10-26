# Agent tools for Orderflow

## Installed in this project

| Tool / skill | Source | Purpose |
| --- | --- | --- |
| Chrome DevTools MCP 1.12.0 | ChromeDevTools/chrome-devtools-mcp | Browser inspection, interaction, screenshots, network, Lighthouse |
| chrome-devtools | Same versioned npm package | Use the browser MCP tools effectively |
| a11y-debugging | Same versioned npm package | Keyboard, semantic structure, accessibility audits |
| troubleshooting | Same versioned npm package | Diagnose browser and MCP connection failures |
| ponytail, ponytail-review, ponytail-audit | @dietrichgebert/ponytail 5.3.2 | Small complete changes, change reviews, project audits |
| prototype | mattpocock/skills | Compare alternative UI and state designs |
| domain-modeling | mattpocock/skills | Clarify workflow terminology and decisions |
| codebase-design | mattpocock/skills | Keep shared interfaces simple and testable |
| tdd | mattpocock/skills | Test behavior with short red/green cycles |

The complete reference files and license notices accompany the skills. The source inventory is in `.agents/skills/sources.json`. Ponytail and Chrome tooling were installed from integrity-verified npm cache entries because shell access to GitHub/npm DNS is blocked. Matt's Markdown was retrieved from the upstream raw files with complete line counts checked.

Skills are repository-scoped under `.agents/skills/`. They become discoverable when Codex opens **this project**, rather than the parent `my-projects` folder. Start a new turn after opening the project; restart the client if they do not appear.

## Activate Chrome DevTools MCP

The project-scoped server configuration is `.codex/config.toml`.

```bash
cd /home/eydriannn/my-projects/orderflow
npm install
codex
```

Load/trust the project when Codex asks, then inspect `/mcp`. The server is named `chrome-devtools`. In another terminal, run `npm run dev`. Ask Codex:

> Use chrome-devtools and a11y-debugging to inspect http://localhost:5173. Test the stock-shortage order, keyboard focus in the order dialog, and the mobile layout.

The configuration runs the locally installed package, uses an isolated temporary browser profile, and disables optional usage statistics and CrUX requests. It does not disable Chrome's sandbox. Configured paths refer to this local project; update `cwd` and `--workspace` if you move it.

The current environment does **not** load this newly added project server into its existing tool catalog. The CLI's server-list command also did not discover it during setup. If your client does not load the project configuration after reopening it, register the installed runtime globally from a normal terminal:

```bash
codex mcp add chrome-devtools -- node /home/eydriannn/my-projects/orderflow/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js --isolated --no-usage-statistics --no-performance-crux --workspace=/home/eydriannn/my-projects/orderflow
codex mcp list
```

This command is provided rather than executed because the session cannot write `~/.codex/config.toml`. Use either the project server or the global registration; avoid duplicating the same server in both scopes. Reopen/restart the client after registration.

## Superpowers: installation still pending

Superpowers was found in the available plugin catalog and its installation action was offered. Complete **Install** for **Superpowers**, then restart/reopen the Codex session. It is not yet confirmed installed or connected. This native plugin route keeps its skill bundle and lifecycle integration together.

Upstream setup: https://github.com/obra/superpowers#codex-cli

## Usage examples

- `$ponytail simplify the order controls without changing behavior.`
- `$ponytail-review review the recent workflow changes.`
- `$domain-modeling clarify the difference between an urgent order and a blocked order.`
- `$codebase-design review the workflow module's public interface.`
- `$prototype compare three layouts for the order detail view.`
- `$tdd add a regression test and fix the identified transition bug.`
- `$a11y-debugging check modal focus, labels, and contrast in the running app.`

Installing these skills does not run an audit, redesign, or refactor by itself.

## Verification and limits

- Installed MCP runtime reports version **1.12.0**.
- Direct MCP `initialize` handshake succeeded.
- `tools/list` returned **32 tools**, including `new_page`, `list_pages`, `take_snapshot`, `take_screenshot`, and `lighthouse_audit`.
- The project config parses as TOML and points to the installed runtime.
- Browser launch, live page interaction, and activation in the existing Codex session remain unverified. Browser/server sockets are restricted here.
- Global Codex configuration and global skill locations were left unchanged because they are read-only in this session.

References: [Chrome tooling](https://github.com/ChromeDevTools/chrome-devtools-mcp), [Ponytail](https://github.com/DietrichGebert/ponytail), [Matt's skills](https://github.com/mattpocock/skills), [Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).
