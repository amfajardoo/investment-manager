# InvestmentManager

A frontend Angular application (generated with Angular CLI v21.x) used to manage investment simulations and user flows.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
# or
ng serve
```

Open http://localhost:4200/ in your browser — the app reloads automatically on code changes.

Note: this workspace includes VS Code tasks for `start` and `test` (see `.vscode/tasks.json` if you use the editor tasks runner).

## Project scripts

- `npm start` — runs the dev server (ng serve)
- `npm test` — runs unit tests (Vitest)
- `npm run build` — production build (ng build)

Use the corresponding `ng` commands directly if you prefer the Angular CLI.

## Tests

Run unit tests with:

```bash
npm test
# or
ng test
```

This project is configured to use Vitest for unit testing.

## Building for production

```bash
npm run build
# or
ng build --configuration production
```

Build artifacts are output to the `dist/` directory.

## Repository structure

- `src/` — application source
	- `src/main.ts` — app entry
	- `src/app/` — application modules, components, features
		- `core/` — services, stores, models, guards
		- `features/` — feature areas (auth, dashboard)
		- `components/` — reusable UI components
	- `src/environments/` — environment configs

## Notable files

- The app root is in `src/app`.
- Environment settings: `src/environments/environment.ts` and `src/environments/environment.development.ts`.

## Contributing

To add components or services, prefer Angular CLI schematics (e.g., `ng generate component`, `ng generate service`) so files and tests are scaffolded consistently.

## References

- Angular CLI: https://angular.dev/cli
- Vitest: https://vitest.dev/
