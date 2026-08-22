`libphonenumber-min.js` is the prebuilt "min metadata" UMD bundle from [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) v1.13.11 (MIT, see LICENSE-libphonenumber-js) — the same file served to the browser at `/assets/js/libphonenumber-min.js`.

It's vendored here rather than installed via npm because Cloudflare Pages does not run `npm install` before bundling `/functions` when the project has no build command, so a `node_modules` dependency can't be resolved at deploy time. This file has no imports of its own (it's a self-contained bundle with metadata baked in), so a plain relative import from `functions/api/*.ts` works without any build step.

To upgrade: download the new version's `bundle/libphonenumber-min.js` from unpkg/jsdelivr and replace this file (and the copy under `/assets/js/`).
