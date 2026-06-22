# VisContext

**VisContext** is the temporary project name for an open platform for publishing
and inspecting structured context about visualizations and visual stories. The
final names for the platform, its records, and their sections are intentionally
unresolved while the conceptual framework is being researched.

The project is currently a functional catalog prototype. It includes nine
fictional projects and eleven attributed records imported from NASA SVS, Our
World in Data, the UK Co-Benefits Atlas, and the IPCC. Together they exercise multi-visualization projects, ordered
stories, large sampled collections, explicit missing metadata, provenance, and
large media collections. The prototype also includes reader-facing context
tables and a local-only author submission form built from a provisional framework.

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

The current implementation tests two flows: readers browse, filter, and inspect
project context; authors draft a project submission and preview it locally.
Authentication, server persistence, and real media upload remain deferred.
