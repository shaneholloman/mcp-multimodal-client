# Features Directory

This directory contains feature-based modules that represent distinct functional areas of the application. Each feature is a self-contained module that includes all necessary components, hooks, and utilities specific to that feature.

## Directory Structure

```
features/
├── agent-registry/        # Agent management and configuration
│   ├── __llm__/        # LLM-specific documentation
│   ├── components/      # Agent-specific UI components
│   ├── hooks/          # Agent-related hooks
│   ├── types/          # Type definitions
│   └── utils/          # Utility functions
├── multimodal-agent/     # Multimodal agent functionality
│   ├── __llm__/       # LLM-specific documentation
│   ├── components/     # UI components
│   ├── hooks/         # Custom hooks
│   └── types/         # Type definitions
├── server/              # Server management
│   ├── __llm__/      # LLM-specific documentation
│   ├── components/    # Server components
│   ├── hooks/        # Server hooks
│   └── types/        # Type definitions
└── llm-registry/        # LLM registry management
    ├── __llm__/      # LLM-specific documentation
    ├── components/    # Registry components
    ├── hooks/        # Registry hooks
    └── types/        # Type definitions
```

## Feature Development Guidelines

### 1. Feature Organization

- Each feature must be self-contained with minimal cross-feature dependencies
- Use `__llm__` directory for LLM-specific documentation
- Implement feature-specific state management within the feature
- Export public API through `index.ts`

### 2. Code Structure

```typescript
// Example feature structure
export interface FeatureConfig {
  // Feature configuration
}

export class FeatureService {
  // Core feature functionality
}

export function useFeature() {
  // Feature hook implementation
}

export const FeatureComponent: React.FC = () => {
  // Component implementation
};
```

### 3. State Management

- Use React Context for feature-level state
- Implement custom hooks for state logic
- Follow immutability patterns
- Handle side effects properly

### 4. Testing Standards

- Unit tests for hooks and utilities
- Integration tests for components
- E2E tests for critical flows
- Test coverage requirements:
  - Hooks: 90%
  - Utils: 90%
  - Components: 80%

### 5. Documentation Requirements

- Each feature must have:
  - README.md in feature root
  - Type documentation
  - Usage examples
  - Architecture diagrams in `__llm__`

## Icons Usage

We use [Solar Duotone icons](https://icon-sets.iconify.design/solar/) through Iconify.

```tsx
import { Icon } from '@iconify/react';

// Example usage
<Icon icon="solar:user-bold-duotone" />
<Icon icon="solar:settings-bold-duotone" />
```

### Icon Categories

| Category    | Example Icons                     |
| ----------- | --------------------------------- |
| Navigation  | `solar:menu-bold-duotone`         |
| Actions     | `solar:add-circle-bold-duotone`   |
| UI Elements | `solar:settings-bold-duotone`     |
| Status      | `solar:notification-bold-duotone` |

## Feature Development Process

1. **Planning**

   - Define feature scope
   - Document requirements
   - Create architecture diagram

2. **Implementation**

   - Follow directory structure
   - Implement core functionality
   - Add comprehensive tests

3. **Documentation**

   - Update README.md
   - Add usage examples
   - Document public API

4. **Review**
   - Code review
   - Documentation review
   - Test coverage check

## Best Practices

1. **Component Design**

   - Use functional components
   - Implement proper prop types
   - Follow accessibility guidelines
   - Use composition over inheritance

2. **Hook Development**

   - Single responsibility principle
   - Proper cleanup in useEffect
   - Memoization where needed
   - Error handling

3. **Type Safety**
   - Use TypeScript strictly
   - Avoid any type
   - Document complex types
   - Use proper generics
