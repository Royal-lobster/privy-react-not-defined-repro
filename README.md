# Privy "React is not defined" — Minimal Reproduction

## Bug

When using `@privy-io/react-auth` with **Next.js 16** + **React 19** and **pnpm**, the app crashes at module evaluation with:

```
⨯ ReferenceError: React is not defined
    at module evaluation (src/app/providers.tsx:3:1)
  1 | "use client";
  2 |
> 3 | import { PrivyProvider } from "@privy-io/react-auth";
```

**Key finding**: This only reproduces with **pnpm** (strict dependency resolution), not with **npm** (flat `node_modules`). This suggests `styled-components` (a dependency of `@privy-io/react-auth`) cannot resolve `React` as a global under pnpm's symlinked `node_modules` structure.

## Environment

| Package | Version |
|---------|---------|
| `next` | 16.1.1 |
| `react` | 19.2.3 |
| `react-dom` | 19.2.3 |
| `@privy-io/react-auth` | 3.14.0 |
| `@privy-io/wagmi` | ^4.0.2 |
| `@tanstack/react-query` | ^5.90.12 |
| Node.js | v22+ |
| Package manager | pnpm 10.x |

## Steps to Reproduce

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000 — the error occurs immediately on page load.

### Does NOT reproduce with npm

```bash
rm -rf node_modules pnpm-lock.yaml
npm install
npm run dev
# Works fine — page loads without errors
```

## Expected Behavior

The page should render without errors. Since Next.js 16 and React 19 use the new JSX transform (`react-jsx`), libraries should not depend on `React` being in scope as a global.

## Actual Behavior

`ReferenceError: React is not defined` at module evaluation time, originating from within `@privy-io/react-auth` internals (likely via `styled-components`).

## Analysis

- `@privy-io/react-auth` depends on `styled-components` ^6.1.13
- `styled-components` internally references `React` as a global (legacy JSX transform or direct `React.createElement` calls)
- Under **npm** (flat `node_modules`), `React` is hoisted to the top level and accessible as an implicit global
- Under **pnpm** (strict, symlinked `node_modules`), `styled-components` cannot resolve `React` because it's not in its own dependency tree — `react` is a peer dependency that must be properly resolved

## Workaround

Adding `import React from "react"` in the consuming file does **not** help since the error originates from within the Privy package's own module evaluation.

Potential workarounds (untested):
- Use `shamefully-hoist=true` in `.npmrc` (defeats the purpose of pnpm)
- Add `react` to `pnpm.overrides` or `public-hoist-pattern`
