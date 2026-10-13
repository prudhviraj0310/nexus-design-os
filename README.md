# NovaDesign Platform

> **AI-Native Design System & Continuous Delivery Platform**  
> An integrated platform connecting design tokens, component registries, AI coding agents (via MCP), quality intelligence audits, and automated GitHub code delivery.

Inspired by the continuous delivery architecture of Supernova, modern W3C Design Tokens Community Group (DTCG) specifications, and the Model Context Protocol (MCP).

---

## 1. Open-Source Ecosystem Audit & Security Assessment

Before writing code, we performed an in-depth audit of the candidate open-source building blocks (see detailed assessment in [`docs/open-source-audit.md`](file:///Users/prudhviraj/Desktop/supernovaclone/docs/open-source-audit.md)):

| Project | Primary Capability | License | Security & Maintenance Assessment | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **`southleft/figma-console-mcp`** | Figma canvas & token sync via MCP | MIT | **Critical Security Findings (Issues #59 & #104):** Unauthenticated local WebSocket bridge allowing local process spoofing/command interception, arbitrary local file read via unconfined `readFileSync`, unsafe `runScripts: "dangerously"`. | **Do not directly bundle.** Re-architect Figma sync over official server-side REST APIs with OAuth2; isolate any local bridge. |
| **`pghoshal/design-system-mcp`** | Design token & pattern context delivery to AI | MIT | Clean, active implementation. Lacks multi-tenant auth and cloud database persistence. | **Adopt MCP tool contracts** (`get_tokens`, `list_components`, `get_design_guidelines`) into our project-scoped server. |
| **`uselayout/cli`** | Component registry & token compliance checks | MIT | Proprietary lock-in with Layout Studio, but solid compliance rule definitions (`meta.never`, `meta.tokens`). | **Adopt compliance patterns** for deterministic agent code validation. |
| **`Supernova-Studio/exporters`** | Multi-target code generation (CSS, TS, iOS, Android) | MIT | Relies on Supernova Pulsar (`.pr`) templating engine with specialized runtime overhead. | **Reference for targets.** Build a modern, typed TypeScript exporter engine. |
| **`Supernova-Studio/design-tokens-format-module`** | W3C DTCG Token Specification helpers | MIT | Industry-standard format (`$value`, `$type`, aliases `{path.alias}`). | **Adopt as canonical internal data model** for universal interoperability. |
| **`Supernova-Studio/agent-skills`** | AI Agent Skill packages for design systems | MIT | Follows Agent Skills open standard (`SKILL.md`). | **Package platform capabilities** as both an MCP server and an Agent Skill. |

---

## 2. Core Architecture: The Cohesive Platform

Rather than maintaining disconnected tools, NovaDesign implements a cohesive **Modular Monolith in TypeScript** (detailed in [`docs/architecture-decision-record.md`](file:///Users/prudhviraj/Desktop/supernovaclone/docs/architecture-decision-record.md)):

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NovaDesign Platform                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌─────────────────────┐               ┌──────────────────────────┐   │
│   │   Design Systems    │  (W3C DTCG)   │   Component Registry     │   │
│   │  Tokens & Themes    ├───────────────┤   Metadata, React types  │   │
│   └──────────┬──────────┘               └─────────────┬────────────┘   │
│              │                                        │                │
│              ▼                                        ▼                │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │           PostgreSQL Database (Drizzle ORM)                    │   │
│   │    Multi-Tenant Workspaces, Projects, Versions, Audits         │   │
│   └──────────────────────┬─────────────────────────────────────────┘   │
│                          │                                             │
│        ┌─────────────────┼──────────────────┐                          │
│        ▼                 ▼                  ▼                          │
│  ┌───────────┐    ┌─────────────┐    ┌──────────────┐                  │
│  │    MCP    │    │ Exporter    │    │   Quality    │                  │
│  │  Server   │    │  Engine     │    │ Intelligence │                  │
│  │ (AI SDK)  │    │ (CSS,TS,TW) │    │   (Linter)   │                  │
│  └─────┬─────┘    └──────┬──────┘    └──────┬───────┘                  │
│        │                 │                  │                          │
│        │                 └────────┬─────────┘                          │
│        ▼                          ▼                                    │
│  ┌───────────┐             ┌──────────────┐                            │
│  │ AI Agents │             │ GitHub PR    │                            │
│  │ (Claude,  │             │ Delivery     │                            │
│  │  Cursor)  │             │ Engine       │                            │
│  └───────────┘             └──────────────┘                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Verified End-to-End Workflow

We have implemented and verified the critical path with **23/23 passing automated tests**:

```
[Design Tokens (W3C DTCG)]
            │
            ▼
[PostgreSQL Database (Drizzle ORM)]
            │
            ├─────────────────────────────────────────────┐
            ▼                                             ▼
[MCP Server Context Delivery]              [Deterministic Exporters]
  - get_design_system                        - tokens.css (:root vars)
  - get_tokens (category filter)             - tokens.json (DTCG format)
  - get_token (alias inspection)             - tokens.ts (typed constants)
  - list_components (props & deps)           - tailwind.tokens.js
  - check_compliance (linter)                             │
            │                                             ▼
            │                              [Quality Intelligence Audit]
            │                                - Hardcoded hex colors
            │                                - Unregistered tokens
            │                                - Deprecated tokens
            │                                             │
            ▼                                             ▼
[AI Coding Agents (Cursor/Claude)] ──────► [GitHub Continuous Delivery]
                                             - Branch creation
                                             - Diff generation
                                             - Automated Pull Request
```

---

## 4. Quick Start & CLI Usage

### Installation
```bash
npm install
```

### Run Automated Test Suite
```bash
npm test
```
All 23 unit and end-to-end integration tests execute against the embedded PostgreSQL engine with zero external setup.

### Seed Database
Seeds a sample multi-tenant workspace (`ws-acme-corp`), project (`proj-core-web`), design system with 19 tokens (colors, primitives, aliases, spacing, typography), and registered React components (`Button`, `Badge`):
```bash
npm run cli seed
```

### Deterministically Export Tokens
Generates production-ready artifacts into `./dist/exported-tokens`:
```bash
npm run cli export
```
Outputs:
- `tokens.css`: CSS custom properties with `:root` selector and alias references.
- `tokens.json`: Official W3C DTCG format tree.
- `tokens.ts`: TypeScript constants with `as const` and union types.
- `tailwind.tokens.js`: Tailwind theme `extend` configuration.

### Run Quality Intelligence Audit
Scans any codebase file for design system violations (hardcoded colors, unknown tokens, deprecated items):
```bash
npm run cli audit tests/e2e.test.ts
```

### Execute GitHub Delivery Workflow
Computes diffs and author a Pull Request for code delivery:
```bash
npm run cli deliver
```

---

## 5. Model Context Protocol (MCP) Server Setup

NovaDesign includes an MCP server built with `@modelcontextprotocol/sdk`. To expose your design system to **Cursor**, **Claude Code**, or other MCP clients:

Add to your `claude_desktop_config.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "novadesign": {
      "command": "node",
      "args": ["/Users/prudhviraj/Desktop/supernovaclone/node_modules/.bin/tsx", "/Users/prudhviraj/Desktop/supernovaclone/src/mcp/server.ts"]
    }
  }
}
```

### Available MCP Tools:
1. `get_design_system`: Returns design system name, version, and tenant metadata.
2. `get_tokens`: Returns design tokens, filterable by category (`color`, `spacing`, etc.).
3. `get_token`: Inspects a specific token path with its full alias resolution chain.
4. `list_components`: Lists reusable UI components, prop signatures, and token dependencies.
5. `check_compliance`: Analyzes code snippets against design tokens and returns actionable fixes.
6. `generate_code`: Deterministically outputs CSS, JSON, TypeScript, or Tailwind code.

---

## 6. Project Structure

```
├── docs/
│   ├── open-source-audit.md           # In-depth audit of 7 repositories & security findings
│   └── architecture-decision-record.md# ADR-001 through ADR-006 & system blueprint
├── src/
│   ├── cli/                           # CLI commands (seed, export, audit, deliver, mcp)
│   ├── core/
│   │   ├── audit/                     # Quality intelligence rules, engine & SARIF reporter
│   │   ├── components/                # Component registry types & models
│   │   ├── delivery/                  # GitHub delivery engine (diffs, branches, PRs)
│   │   ├── exporters/                 # CSS, JSON, TypeScript, Tailwind code generators
│   │   └── tokens/                    # W3C DTCG parser, validator, alias resolver
│   ├── db/                            # Drizzle ORM PostgreSQL schema & seed data
│   └── mcp/                           # Official MCP server exposing project tools
└── tests/
    ├── audit.test.ts                  # Compliance rule unit tests
    ├── delivery.test.ts               # Continuous delivery tests
    ├── e2e.test.ts                    # Full workflow integration test
    ├── exporters.test.ts              # Code generator tests
    ├── mcp.test.ts                    # MCP tool and authorization tests
    └── tokens.test.ts                 # Token parsing and cycle detection tests
```
