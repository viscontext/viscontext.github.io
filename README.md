# VisContext

**VisContext** is the temporary project name for an open platform for publishing
and inspecting structured context about visualizations and visual stories. The
final names for the platform, its records, and their sections are intentionally
unresolved while the conceptual framework is being researched.

The project is currently in its planning and specification phase.

## Project documents

- [Product and implementation plan](docs/implementation-plan.md)

## Current direction

The first implementation slice will be deliberately small: a schema-driven,
read-only placeholder record rendered from repository fixtures. The framework
will be maintained separately from the website, using human-editable YAML,
JSON Schema validation, and generated JSON. Authentication, databases,
comments, and verification will be implemented only after the information model
has been tested with representative visualization examples. The eventual
platform will include authenticated accounts, persistent drafts, direct browser
submission, and media upload.
