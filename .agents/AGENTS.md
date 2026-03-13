# Repo Guidance

This file is the source of truth for repo-local agent instructions. Any `CLAUDE.md` mirror in this repository should be a symlink to this file.

## Project

- Expo Router app targeting iOS, Android, and web.
- TypeScript + React Native + Zustand.
- Persistence is local-first with optional Supabase sync through `services/hybrid-storage.ts`.
- User-facing copy is localized through `i18n/`.

## Important Paths

- `app/`: Expo Router screens and layouts.
- `components/`: shared UI components.
- `store/`: Zustand stores, hydration, and session logic.
- `services/`: AsyncStorage, Supabase, and hybrid persistence.
- `content/`: books, drawings, math, and other learning content.
- `i18n/`: translation config and locale files.

## Common Commands

```bash
npm install
npm start
npm run ios
npm run android
npm run web
npm run typecheck
npm run lint:check
npm run format
```

## Working Rules

- Preserve the existing Expo Router structure and `@/` path aliases.
- Keep local-first behavior intact unless the task explicitly changes sync semantics.
- When adding user-visible strings, update the relevant files in `i18n/`.
- Prefer clear React 19 patterns over defensive memoization.
- Do not leave redundant guidance here; keep this file short and current.

## Review

After finishing implementation and local verification, run exactly one Claude Code review with the local `code-reviewer` skill:

```bash
claude -p "/code-reviewer Review the current working tree changes in /Users/michalchudziak/Projects/NaukaLiluka. Focus on correctness, regressions, maintainability, and missing tests. Wait until the review is complete and then return a single final review with no intermediate updates."
```

- Run this once per task.
- Wait for the command to finish even if it is quiet for a few minutes.

## Testing

There is no dedicated automated test suite configured in this repo, so each task should produce a focused test plan before validation.

For every non-trivial change:

1. Write a short test plan covering affected flows, setup, expected behavior, and regression risks.
2. Run the relevant static checks, usually `npm run typecheck` and `npm run lint:check`.
3. If the change affects runtime behavior, validate it with `agent-device` after implementation is complete.
4. If the change is docs-only or otherwise non-runtime, explicitly say why device testing was skipped.

Use `agent-device` for post-change UI validation. Prefer a deterministic simulator flow and resnapshot after UI changes:

```bash
agent-device ensure-simulator --platform ios --device "iPhone 16" --boot
agent-device open <app-name> --platform ios --device "iPhone 16" --session qa-ios --relaunch
agent-device snapshot -i
# interact, assert, and resnapshot as needed
agent-device close
```

Reference:

- `.agents/skills/code-reviewer/SKILL.md`
- `.agents/skills/agent-device/SKILL.md`
