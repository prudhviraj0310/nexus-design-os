# Architecture Decision Record (ADR) & System Blueprint

**System:** AI-Native Design System & Continuous Delivery Platform (`NovaDesign`)  
**Status:** Approved & Active  
**Author:** Principal Software Architect  

---

## 1. System Overview & Core Objectives

NovaDesign is a unified platform connecting design tokens, component registries, AI coding agents, and automated code delivery. Rather than gluing together fragmented tools, NovaDesign unifies these capabilities into a single source of truth.

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

## 2. Key Architecture Decisions

### ADR-001: Modular Monolith Architecture
* **Decision:** Implement NovaDesign as a modular monolith in TypeScript rather than premature microservices.
* **Rationale:** Maximizes developer velocity, ensures strong end-to-end typing across schemas, token parsers, MCP tools, and delivery pipelines, while maintaining clear internal package boundaries:
  - `core/tokens`: Token parser, validator, cycle detector, alias resolver.
  - `core/exporters`: Deterministic code generators (CSS variables, JSON, TypeScript, Tailwind).
  - `core/audit`: Static analysis rules, AST/regex linter, SARIF reporter.
  - `core/mcp`: Model Context Protocol server exposing project tools.
  - `core/delivery`: GitHub API client, branch/diff/PR pipeline.
  - `db`: Drizzle ORM schema, migrations, repository layer.

### ADR-002: W3C Design Tokens Community Group (DTCG) as Native Format
* **Decision:** All design tokens are stored and manipulated using the W3C DTCG standard (`$value`, `$type`, `$description`, `{path.to.alias}` syntax).
* **Rationale:** Guarantees universal interoperability with Figma Variables, Tokens Studio, Style Dictionary, and emerging design tools without proprietary lock-in.

### ADR-003: Multi-Tenant Relational Storage with Drizzle ORM
* **Decision:** Use PostgreSQL with Drizzle ORM for type-safe relational modeling, supporting strict workspace/project tenancy, versioned immutable token releases, and audit logs.
* **Driver Strategy:** In production, connects to any Postgres service (Neon, Supabase, RDS). In local/test environments, supports `@electric-sql/pglite` or SQLite/Postgres seamlessly with zero external daemon requirements.

### ADR-004: Model Context Protocol (MCP) Integration
* **Decision:** Implement an MCP server utilizing `@modelcontextprotocol/sdk` exposing standard JSON-RPC tools:
  - `get_design_system`: High-level system metadata, brands, and version status.
  - `get_tokens`: Filterable by category, theme, or name.
  - `get_token`: Detailed inspection of a specific token and its alias chain.
  - `list_components`: Query reusable UI components and prop specifications.
  - `check_compliance`: Analyze code snippets for design system adherence.
  - `generate_code`: Deterministically produce tokens in requested output formats.
* **Security Guardrail:** All tool calls require valid project credentials (`workspaceId` and `projectId`), preventing unauthorized multi-tenant data leakage.

### ADR-005: Deterministic Code Generation & Compliance Engine
* **Decision:** Code generation must be 100% deterministic and reproducible without non-deterministic LLM hallucinations.
* **Compliance Checks:** Deterministic lint rules evaluate:
  1. `RULE-001-HARDCODED-COLOR`: Detects raw hex/rgb/hsl color values.
  2. `RULE-002-UNKNOWN-TOKEN`: Validates that `--color-*` or CSS custom properties exist in the token registry.
  3. `RULE-003-DEPRECATED-TOKEN`: Flags tokens flagged as deprecated.
  4. `RULE-004-HARDCODED-SPACING`: Flags raw pixel spacing values violating the scale.

### ADR-006: GitHub Continuous Delivery Engine
* **Decision:** Automated code delivery uses the GitHub REST API to perform idempotent branch creation, file commits, and Pull Request authoring.
* **Safety:** Direct pushes to protected branches are blocked; all updates require previewable diffs and PR reviews.

---

## 3. The Smallest End-to-End Workflow Milestone

The foundational milestone proves the entire architecture before investing in complex UI:
1. **Workspace & Project Creation:** Register an organization and project in the database.
2. **Token Ingestion & Validation:** Store W3C DTCG tokens with alias resolution and circular dependency checks.
3. **MCP Tool Context:** Expose those stored tokens live via the MCP server.
4. **Code Generation:** Deterministically generate CSS custom properties and TypeScript exports.
5. **Quality Compliance Check:** Scan sample code against the token repository.
6. **GitHub Delivery:** Package the generated code into an idempotent Git commit and Pull Request.
7. **Verification:** Automated Vitest test suite executing and asserting each step.
