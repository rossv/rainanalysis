# AGENTS.md

## Core workflows
- `npm run dev` - start the Vite development server.
- `npm run build` - run TypeScript project build (`tsc -b`) and then bundle with Vite.
- `npm run lint` - run ESLint across the repo (`eslint .`).
- `npm run preview` - serve the built app locally with Vite preview.

## Rain parser verification
- `node scripts/test_parsing.js` - parse all files in `examples/` and print point counts plus first/last samples.
- `scripts/test_parsing.ts` - TypeScript variant of the same parser verification harness.

## TODO
- Add a package script (for example `test:parsing`) so parser verification can be run via `npm run` instead of a direct Node command.
