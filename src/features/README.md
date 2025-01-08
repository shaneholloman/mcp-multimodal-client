# Features Directory

This directory contains feature-based modules that represent distinct functional areas of the application. Each feature is a self-contained module that includes all necessary components, hooks, and utilities specific to that feature.

## Structure

```
features/
├── agents/                # Agent management and execution
│   ├── components/       # Agent-specific UI components
│   ├── hooks/           # Agent-related hooks
│   ├── types/           # Agent type definitions
│   └── utils/           # Agent utility functions
├── server/               # Server management and configuration
│   ├── components/      # Server-specific components
│   ├── hooks/          # Server-related hooks
│   └── types/          # Server type definitions
└── [feature]/           # Template for new features
```

## Guidelines

1. Each feature should be self-contained and minimize dependencies on other features
2. Common functionality should be moved to shared/
3. Each feature should have its own types/ directory for TypeScript definitions
4. Components should be organized by domain rather than by type
5. Use index.ts files to expose public API of each feature

## Icons Usage

We use [Solar Duotone icons](https://icon-sets.iconify.design/solar/) through Iconify. To use an icon in your components:

```tsx
import { Icon } from '@iconify/react';

// Example usage
<Icon icon="solar:user-bold-duotone" />
<Icon icon="solar:settings-bold-duotone" />
```

Common icon categories:

- Navigation: `solar:menu-bold-duotone`, `solar:arrow-left-bold-duotone`
- Actions: `solar:add-circle-bold-duotone`, `solar:trash-bin-bold-duotone`
- User Interface: `solar:settings-bold-duotone`, `solar:notification-bold-duotone`

## Adding New Features

1. Create a new directory under features/
2. Include all necessary subdirectories (components/, hooks/, etc.)
3. Create a README.md explaining the feature's purpose
4. Export public API through index.ts
5. Keep feature-specific state management within the feature
