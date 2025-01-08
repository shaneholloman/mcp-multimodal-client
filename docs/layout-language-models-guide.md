# Layout Component

## Overview

The Layout component serves as the main structural wrapper for pages and content sections in the application. It provides consistent spacing, padding, and structural organization across different views.

## Available Variants

- Default Layout: Standard page layout with header and footer
- Minimal Layout: Simplified version without header/footer for specific use cases
- Full-width Layout: Extends to screen edges without side padding

## Props and Configuration

| Prop      | Type                                   | Default   | Description                              |
| --------- | -------------------------------------- | --------- | ---------------------------------------- |
| children  | ReactNode                              | required  | Content to be rendered within the layout |
| variant   | 'default' \| 'minimal' \| 'full-width' | 'default' | Layout style variant                     |
| className | string                                 | ''        | Additional CSS classes                   |
| padding   | boolean                                | true      | Enable/disable default padding           |

## Usage Examples

```jsx
// Basic usage
<Layout>
  <YourContent />
</Layout>

// Minimal variant
<Layout variant="minimal">
  <AuthenticationForm />
</Layout>

// Full-width with custom class
<Layout variant="full-width" className="custom-bg">
  <Dashboard />
</Layout>
```

## Testing Guidelines

1. Verify proper rendering of all layout variants
2. Test responsive behavior across different screen sizes
3. Validate proper spacing and padding application
4. Check accessibility compliance
5. Ensure proper propagation of className prop
