# VisContext

**VisContext** is the temporary project name for an open platform for publishing
and inspecting structured context about visualizations and visual stories. The
final names for the platform, its records, and their sections are intentionally
unresolved while the conceptual framework is being researched.

The project is currently in its experimental framework phase. Increment 0
implements one provisional section and one fictional record end to end.

## Project documents

- [Product and implementation plan](docs/implementation-plan.md)

## Local development

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Run the complete validation, test, type-check, build, and HTML accessibility
pipeline with:

```sh
npm run check
```

## Architecture

```text
framework + examples -> framework tooling -> canonical JSON -> website + static API
```

- `framework/` is the language-neutral conceptual framework.
- `packages/framework-tooling/` validates YAML and generates canonical JSON.
- `apps/web/` renders only generated data with Astro.
- GitHub Actions validates every change and deploys `main` to GitHub Pages.

## Current direction

The current implementation is deliberately small: a schema-driven, read-only
placeholder record rendered from repository fixtures. Authentication,
databases, comments, and verification will be implemented only after the
information model has been tested with representative visualization examples.
The eventual platform will include authenticated accounts, persistent drafts,
direct browser submission, and media upload.
