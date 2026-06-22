# Experimental context framework

This directory is the language-neutral research artifact behind VisContext.
It contains no website components, routes, CSS, or database assumptions.

The current `0.4.0` framework is a deliberately provisional catalog fixture.
Its six sections, fictional records, and imported source records test whether terminology, sections, fields,
and presentation guidance can change without requiring changes to the consuming
website. They are not a proposed final taxonomy.

Imported records include source provenance and preserve absent source metadata as
explicit null values. Representative downloadable files are modeled as media
assets of a visualization rather than being counted as separate visualizations.

## Files

- `framework.yaml` registers the version and its sections.
- `terminology.yaml` contains replaceable public terminology.
- `schemas/` contains structural JSON Schemas expressed as YAML.
- `presentation/` contains labels, guidance, and default ordering.
- `examples/` contains fictional and attributed real-world records used to exercise the framework.

Run `npm run generate` from the repository root to validate the framework and
emit canonical JSON. Generated files are build artifacts and are not committed.
