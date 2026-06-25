# Local Firebase upload workflow

The local author workflow uses Firebase's Local Emulator Suite with the project
ID `demo-viscontext`. Firebase reserves the `demo-` prefix for emulator-only
projects: this configuration has no live resources and cannot fall through to a
billable service.

## Start the complete stack

Requirements:

- Node.js 22 or later
- Java 11 or later

```sh
npm install
npm run dev:local
```

Open:

- website: `http://127.0.0.1:4321/upload/`
- Emulator Suite: `http://127.0.0.1:4000/`

The first emulator start downloads Firebase's local binaries. Emulator data is
temporary and is cleared when the processes stop.

## Current local behavior

1. “Start demo author session” creates an anonymous user in the Authentication
   emulator.
2. “Save private draft” stores a versioned JSON payload in the `submissions`
   Firestore collection.
3. An optional PNG, JPEG, or WebP preview is uploaded under the current user's
   Storage path. SVG and files larger than 5 MB are rejected by both the browser
   and Storage rules.
4. “Submit for review” changes the draft status to `submitted`. Authors cannot
   modify a submitted record.
5. The Emulator Suite UI exposes local users, documents, files, and request
   diagnostics.

## Authorization tests

```sh
npm run test:rules
```

The test command starts isolated Firestore and Storage emulators and verifies
owner-only access, anonymous denial, immutable submitted records, MIME-type
validation, and the file-size limit.

## Production boundary

The browser adapter currently initializes Firebase only on `localhost` and
`127.0.0.1`. The public GitHub Pages build therefore cannot contact a live
Firebase project. Production configuration will be added separately through
environment variables after the data model and workflow have been tested.

Firebase web configuration is public application configuration. Service-account
keys remain server-side secrets and must never be placed in this repository.
