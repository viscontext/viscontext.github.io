# VisContext

**VisContext** is the temporary project name for an open platform for publishing
and inspecting structured context about visualizations and visual stories. The
final names for the platform, its records, and their sections are intentionally
unresolved while the conceptual framework is being researched.

The project is currently a functional catalog prototype. It includes nine
fictional projects and eleven attributed records imported from NASA SVS, Our
World in Data, the UK Co-Benefits Atlas, and the IPCC. Together they exercise multi-visualization projects, ordered
stories, large sampled collections, explicit missing metadata, provenance, and
large media collections. Every attributed record exposes an original source
preview in the catalog and project page. The prototype also includes reader-facing context
tables and an emulator-backed author submission form built from a provisional framework.

## Project documents

- [Product and implementation plan](docs/implementation-plan.md)
- [Local Firebase upload workflow](docs/firebase-local.md)
- [Prototype badge downloads](https://viscontext.github.io/badges/)

## Local development

Requires Node.js 22 or later. The complete local upload workflow also requires
Java 11 or later for the Firebase emulators.

```sh
npm install
npm run dev:local
```

This starts the site at `http://127.0.0.1:4321` and the Firebase Emulator Suite
at `http://127.0.0.1:4000`. It uses the local-only `demo-viscontext` project;
no Firebase account, credentials, or billing account is involved. Use `npm run
dev` when only the static catalog is needed.

Run the complete validation, test, type-check, build, and HTML accessibility
pipeline with:

```sh
npm run check
npm run test:rules
```

## Architecture

```text
framework + examples -> framework tooling -> canonical JSON -> website + static API
```

- `framework/` is the language-neutral conceptual framework.
- `packages/framework-tooling/` validates YAML and generates canonical JSON.
- `apps/web/` renders generated catalog data with Astro and connects the local
  author workflow through a Firebase adapter.
- `firebase/` contains local Firestore and Storage authorization rules and their
  emulator-backed tests.
- GitHub Actions validates every change and deploys `main` to GitHub Pages.

## Current direction

The current implementation tests two flows: readers browse, filter, and inspect
project context; authors use a local Firebase session to save private Firestore
drafts, upload constrained preview images, and submit records for review.
It also includes downloadable SVG badge variants and project-specific embed
snippets that can link from an external visualization back to its context
record. Production Firebase configuration, reviewer publication, and generated
status-aware badges remain deferred.
