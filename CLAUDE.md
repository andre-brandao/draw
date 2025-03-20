# CLAUDE.md - Paint App Guidelines

## Build & Development Commands
```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type checking
pnpm run check

# Formatting
pnpm run format

# Linting
pnpm run lint
```

## Code Style Guidelines

### TypeScript & Svelte
- Use TypeScript types for all component props, state, and functions
- Follow Svelte 5 conventions with `$state`, `$bindable`, and `$props`
- Export component methods that need to be accessed by parent components
- Name event handlers with `handle*` prefix (e.g., `handleClick`)

### Format & Structure
- Keep components focused on single responsibilities
- Use TypeScript interfaces in `src/types.d.ts` for shared types
- Place utility functions in `src/lib/` directory
- Follow existing naming conventions (PascalCase for components, camelCase for variables)
- Default to strict null/undefined checking
- Use SVG for icons and visual elements when possible
- Maintain clean component tree structure