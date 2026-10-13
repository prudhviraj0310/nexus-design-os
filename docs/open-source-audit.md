# Open-Source Ecosystem Audit & Dependency Assessment

**Project:** AI-Native Design System & Development Platform (`Supernova Clone / NovaDesign Platform`)  
**Date:** March 2026  
**Auditor:** Principal Software Architect & AI Infrastructure Engineer  

---

## 1. Executive Summary

We evaluated seven primary open-source repositories and related industry initiatives to determine whether they can serve as direct dependencies, architectural references, or cautionaries for our AI-native design system platform:

1. **`southleft/figma-console-mcp`** (Figma Console MCP)
2. **`pghoshal/design-system-mcp`** (Design System MCP)
3. **`uselayout/cli`** (`@layoutdesign/context` / Layout Studio)
4. **`Supernova-Studio/exporters`** (Supernova Exporter Monorepo)
5. **`Supernova-Studio/exporter-documentation`** (Supernova Doc Publishing Engine)
6. **`Supernova-Studio/design-tokens-format-module`** (DTCG Standard Module)
7. **`Supernova-Studio/agent-skills`** (Supernova AI Agent Skills)

### Key Architectural Finding
**No single repository provides a complete, production-grade drop-in replacement for Supernova.** However:
- **`uselayout/cli`** and **`pghoshal/design-system-mcp`** provide the exact pattern for exposing tokens and component guidelines via Model Context Protocol (MCP) to AI coding agents like Cursor and Claude.
- **`Supernova-Studio/exporters`** and **`design-tokens-format-module`** show how to structure code generation pipelines around W3C DTCG (Design Tokens Community Group) standards.
- **`southleft/figma-console-mcp`** has high value for Figma canvas interaction, but possesses **severe architectural security vulnerabilities** in local communication that require isolation and reimplementation rather than blind adoption.

---

## 2. In-Depth Repository Evaluation

### 2.1. `southleft/figma-console-mcp`
* **Role:** Bridge between AI assistants and Figma canvas/files via MCP.
* **License:** Open Source (MIT / Apache variant).
* **Capabilities:**
  - Bidirectional sync: extracts Figma variables, styles, components.
  - Direct canvas manipulation: creates/updates variables, nodes, FigJam notes via WebSocket bridge to a local Figma plugin.
  - Parity checking between design tokens and React code.
* **Critical Security Findings & Vulnerabilities:**
  - **Issue #59 / #104 (Unauthenticated Local WebSocket Bridge):** The bridge server accepted connections from any local process without origin validation or mutual authentication. Malicious local processes could spoof `FILE_INFO`, inject `CONSOLE_CAPTURE`, or intercept commands (`EXECUTE_CODE`).
  - **Arbitrary File Read Vulnerability:** `readFileSync` calls in local image handlers lacked path traversal sanitization, enabling reading arbitrary host files if parameter inputs were untrusted.
  - **Unsafe Script Execution:** Usage of `runScripts: "dangerously"` in internal parsing pipelines.
* **Verdict & Integration Decision:** **ADAPT ARCHITECTURALLY, DO NOT DIRECTLY BUNDLE.**
  - We do *not* run untrusted local WebSocket daemons without cryptographically signed session tokens and strict directory confinement.
  - For our platform, Figma integration must use official **Figma REST APIs + OAuth 2.0** for server-side token & component ingestion, avoiding brittle desktop plugin hacks unless explicitly authorized in an isolated local bridge module.

---

### 2.2. `pghoshal/design-system-mcp`
* **Role:** Model Context Protocol server delivering design system tokens, patterns, and rules to AI coding agents.
* **License:** MIT License.
* **Capabilities:**
  - Serves tokens (colors, typography, spacing, border radiuses) as structured MCP resources and tools.
  - Grounding context: Prevents LLMs from hallucinating arbitrary HEX values or inventing nonexistent button variants.
  - Deterministic context delivery.
* **Limitations:**
  - Built primarily as a static file or single-repo MCP server rather than a multi-tenant cloud platform.
  - Lacks tenant isolation, database persistence, and automated delivery pipelines (GitHub PR creation).
* **Verdict & Integration Decision:** **ADAPT TOOL CONTRACTS.**
  - We adopt its clean tool naming schemas (`get_tokens`, `list_components`, `get_design_guidelines`) and integrate them natively into our project-scoped, authenticated MCP server.

---

### 2.3. `uselayout/cli` (`@layoutdesign/context`)
* **Role:** CLI & MCP server for design system context, token management, and agent compliance checks.
* **License:** MIT / Open Source.
* **Capabilities:**
  - Semantic token abstraction (`--layout-*` / `--color-*`).
  - Agent compliance checks: rules like `meta.usage`, `meta.never`, and `meta.tokens` to enforce that AI coding models use only designated design tokens.
  - Tooling for updating tokens and retrieving UI screenshot references.
* **Limitations:**
  - Tight coupling with Layout Studio's proprietary ecosystem and Figma plugin.
  - Not designed as a standalone enterprise-hosted platform backend.
* **Verdict & Integration Decision:** **ADAPT COMPLIANCE PATTERNS.**
  - Incorporate the concept of **Deterministic Agent Compliance Auditing** (`check_compliance` tool) into our MCP server and validation engine, ensuring code generated by agents or developers is scored against token definitions.

---

### 2.4. `Supernova-Studio/exporters` & `exporter-documentation`
* **Role:** Template-driven code generation and documentation publishing engines.
* **License:** MIT License.
* **Capabilities:**
  - Pulsar template engine and TypeScript modules generating CSS, SCSS, TypeScript, Android XML, iOS Swift, and Flutter themes.
  - Documentation exporter for generating static documentation sites from design system definitions.
* **Limitations:**
  - Pulsar templating engine has specialized syntax (`.pr` files) with significant cognitive overhead and legacy runtime dependencies.
  - Requires Supernova's cloud backend to supply runtime context objects.
* **Verdict & Integration Decision:** **REFERENCE FOR TARGET FORMATS, BUILD A MODERN DETERMINISTIC ENGINE.**
  - Instead of legacy `.pr` templates, build a clean, typed TypeScript exporter engine (similar to Style Dictionary v4 and modern DTCG transformers) that outputs CSS variables, JSON tokens, TS definitions, and Tailwind presets reproducibly.

---

### 2.5. `Supernova-Studio/design-tokens-format-module`
* **Role:** TypeScript definitions and specification helpers for the W3C Design Tokens Community Group (DTCG) standard.
* **License:** MIT License.
* **Capabilities:**
  - Universal token schema: `$value`, `$type` (color, dimension, typography, shadow, duration, cubicBezier), `$description`, `$extensions`.
  - Formalizes token alias syntax: `{color.brand.primary}`.
* **Verdict & Integration Decision:** **DIRECTLY COMPLIANT DATA MODEL.**
  - Adopt the W3C DTCG schema as our native database and export representation. This guarantees 100% interoperability with Figma Variables, Tokens Studio, Style Dictionary, and external exporters.

---

### 2.6. `Supernova-Studio/agent-skills`
* **Role:** Modular AI Agent Skills (`SKILL.md` format) for interacting with design systems in AI coding environments (Claude Code, Cursor, AGY).
* **License:** MIT License.
* **Capabilities:**
  - Standardized progressive disclosure of skills and instructions for AI agents.
* **Verdict & Integration Decision:** **ADOPT AND EXTEND.**
  - Package our platform's capabilities into an Agent Skill and MCP server so developers can simply add our skill or point their IDE to our MCP endpoint.

---

## 3. Comparative Matrix

| Project | License | Direct Dependency? | Key Value | Risk / Limitation |
| :--- | :--- | :--- | :--- | :--- |
| `southleft/figma-console-mcp` | MIT | No (Informs bridge) | Figma bidirectional sync | Security vulnerabilities (Issues #59, #104: unauthenticated WS bridge, readFileSync) |
| `pghoshal/design-system-mcp` | MIT | No (Informs MCP tools) | Agent token & rule context | Single-tenant, lacks cloud persistence & PR delivery |
| `uselayout/cli` | MIT | No (Informs compliance) | Compliance checks (`meta.never`) | Coupled to Layout Studio proprietary ecosystem |
| `Supernova-Studio/exporters` | MIT | Architectural reference | Multi-platform output targets | Complex Pulsar template engine dependencies |
| `Supernova-Studio/design-tokens-format-module` | MIT | Compatible Spec Model | W3C DTCG compliance | Schema-only; requires execution engine |
| `Supernova-Studio/agent-skills` | MIT | Pattern reference | AI agent skill layout | Thin wrapper over existing cloud APIs |

---

## 4. Architectural Strategy & Synthesis

We will not build five disconnected tools. Instead, we implement a **unified, cohesive platform architecture**:

1. **Source of Truth:** PostgreSQL with Drizzle ORM, storing Workspaces, Projects, Token Trees (W3C DTCG), Component Registries, Versions, and Audit Logs.
2. **Deterministic Token & Export Engine:** Parses, validates, resolves aliases, detects cycles, and generates production code (CSS, JSON, TS, Tailwind) deterministically.
3. **Model Context Protocol (MCP) Server:** Official `@modelcontextprotocol/sdk` implementation exposing project-authorized tools (`get_design_system`, `get_tokens`, `list_components`, `check_compliance`, `generate_code`).
4. **Quality & Compliance Linter:** Analyzes code for hardcoded styles, invalid tokens, and deprecated components, returning structured findings and SARIF output.
5. **GitHub Continuous Delivery Engine:** Automates branch creation, file commits, and Pull Requests with idempotent diff verification.
