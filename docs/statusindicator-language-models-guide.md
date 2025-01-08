# StatusIndicator Component

## Overview

The StatusIndicator component provides a visual representation of various states through colored indicators. It's commonly used to show status, progress, or availability in the interface.

## Available Variants

- Dot: A simple circular indicator
- Pulse: An animated pulsing indicator
- Ring: A circular outline indicator

## Props and Configuration

| Prop    | Type                                           | Default   | Description                       |
| ------- | ---------------------------------------------- | --------- | --------------------------------- |
| variant | 'dot' \| 'pulse' \| 'ring'                     | 'dot'     | The visual style of the indicator |
| status  | 'success' \| 'warning' \| 'error' \| 'neutral' | 'neutral' | The status to display             |
| size    | 'sm' \| 'md' \| 'lg'                           | 'md'      | The size of the indicator         |

## Usage Examples

```jsx
// Basic usage
<StatusIndicator status="success" />

// With variant
<StatusIndicator variant="pulse" status="warning" />

// With custom size
<StatusIndicator variant="ring" status="error" size="lg" />
```

## Testing Guidelines

1. Test all variant combinations
2. Verify color mappings for each status
3. Check accessibility requirements
4. Validate size adjustments
5. Test animation behaviors for pulse variant
