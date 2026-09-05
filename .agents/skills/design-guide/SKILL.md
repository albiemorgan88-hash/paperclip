---
name: design-guide
description: Apply Paperclip's design system when changing UI components, pages or styling.
---

# Paperclip Design Guide

Paperclip is a dense, keyboard-driven control plane. Keep information scannable, use inline editing where appropriate, and support both light and dark themes.

## Sources and routing

Paths below are relative to the Paperclip repository root.

- `ui/src/index.css` defines current semantic colour and spacing tokens.
- `ui/src/pages/DesignGuide.tsx` is the living component showcase.
- Read [the component index](references/component-index.md) when choosing or adding reusable components.
- Read the relevant section of [UI patterns](references/patterns.md) for typography, status/priority, composition, focus, layouts or showcase examples.
- `frontend-design` and `web-design-guidelines` are optional when installed and relevant. Their absence does not block work; use the local tokens, components and showcase.

## Invariants

- Use semantic tokens and existing typography/status components instead of independent colour systems. Keep focus states visible and preserve keyboard interaction.
- Compose shadcn/Radix primitives; place domain composites in `ui/src/components/` and pages in `ui/src/pages/`.
- Reuse meaningful patterns without extracting wrappers for every one-off layout. Use `cn()` for class merging and CVA when visual variants need it.
- Add new reusable components and composition patterns to the showcase; update affected showcase examples when an API changes. Update the component index for new reusable components.
- Keep component names PascalCase, primitives kebab-case, and hooks in `ui/src/hooks/useName.ts`.

Verify the affected states and interactions in the resulting UI. A token or component change should be checked wherever that shared behaviour is used.
