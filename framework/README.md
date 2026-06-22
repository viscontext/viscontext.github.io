# Experimental context framework

This directory is the language-neutral research artifact behind VisContext.
It contains no website components, routes, CSS, or database assumptions.

The current `0.3.0` framework is a deliberately provisional catalog fixture.
Its six sections and fake records test whether terminology, sections, fields,
and presentation guidance can change without requiring changes to the consuming
website. They are not a proposed final taxonomy.

## Files

- `framework.yaml` registers the version and its sections.
- `terminology.yaml` contains replaceable public terminology.
- `schemas/` contains structural JSON Schemas expressed as YAML.
- `presentation/` contains labels, guidance, and default ordering.
- `examples/` contains records used to exercise the framework.

Run `npm run generate` from the repository root to validate the framework and
emit canonical JSON. Generated files are build artifacts and are not committed.
