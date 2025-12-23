# Repository Guidelines

## Project Structure & Module Organization
The Vite + Vue 3 front end sits at the repository root. `index.html` loads `main.ts`, which mounts `App.vue` (the ticket experience) and imports global styles. Domain defaults stay in `constants.tsx`, shared contracts in `types.ts`, and IRPF/IVA/Seguridad Social helpers in `utils/calculations.ts`. Styling relies on Tailwind utility classes plus tokens from `index.css`, `tailwind.config.js`, and `postcss.config.js`. Keep feature-specific code close together and move reusable helpers into `utils/`.

## Build, Test, and Development Commands
- `npm install` boots the toolchain (Vue 3, Vite 6, Tailwind 3, TypeScript 5.8, vue-tsc).
- `npm run dev` launches the Vite dev server with hot reload at `http://localhost:5173`.
- `npm run build` performs an optimized production build and runs the Vue/TypeScript checker.
- `npm run preview` serves the latest build for pre-deploy smoke tests.
- `npx vue-tsc --noEmit` is the quickest way to catch typing regressions on CI when a full build is unnecessary.

## Coding Style & Naming Conventions
Favor single-file components with `<script setup>` using `reactive`/`computed`; move derived values into helpers rather than watchers. Follow the two-space indentation, semicolons, and single quotes already present. Types/interfaces and components use PascalCase, composition helpers use camelCase, and constants remain SCREAMING_SNAKE_CASE (`SOCIAL_SECURITY_EMPLOYER_RATE`). Prefer Tailwind utility classes over custom CSS, reusing tokens such as `bg-background-light` and `text-stone-500`. Reach for the `@/*` path alias once a relative path grows noisy.

## Testing Guidelines
There is no dedicated automated suite yet; when touching calculation helpers, add focused unit specs (`utils/__tests__/calculations.spec.ts`) using Vitest or Jest and run them with `vitest run`. For UI tweaks, describe manual scenarios (e.g., “set salario bruto to 50 000 and toggle Anual/Mensual”) in the pull request and capture any rounding edge cases. Always end with `npm run build` so the compiler, JSX transforms, and Tailwind extraction stay clean.

## Commit & Pull Request Guidelines
Recent history favors short, imperative Spanish messages (`cambiar texto`, `padding`); keep that tone, describe the visible outcome, and group unrelated work into separate commits. Pull requests should include: a concise summary, screenshots or GIFs for UI work, manual/automated test notes, and links to related issues. Confirm that `npm run build` and any introduced tests pass before requesting review, and call out any follow-up tasks so they can be tracked explicitly.
