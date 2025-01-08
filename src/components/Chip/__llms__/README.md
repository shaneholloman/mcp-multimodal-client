# Chip Components

## Overview

Chip components provide compact elements for displaying information, tags, or status indicators.

## Available Components

### BaseChip

Foundation chip component with customizable appearance.

```tsx
<Chip label="Label" color="primary" size="md" onClose={() => {}} icon="tag" />
```

### StatusChip

Specialized chip for displaying status information.

```tsx
<StatusChip status="success" label="Connected" icon="check-circle" />
```

### FilterChip

Interactive chip for filter selections.

```tsx
<FilterChip label="Filter" selected={true} onChange={() => {}} />
```

## Props

### BaseChip Props

- `label: string` - Chip text
- `color?: ChipColor` - Color variant
- `size?: 'sm' | 'md' | 'lg'` - Chip size
- `icon?: string` - Optional icon
- `onClose?: () => void` - Optional close handler
- `className?: string` - Additional CSS classes

### StatusChip Props

- `status: 'success' | 'warning' | 'error' | 'info'` - Status type
- `label: string` - Status text
- `icon?: string` - Optional status icon
- `className?: string` - Additional CSS classes

### FilterChip Props

- `label: string` - Filter text
- `selected: boolean` - Selection state
- `onChange: (selected: boolean) => void` - Selection handler
- `disabled?: boolean` - Disabled state
- `className?: string` - Additional CSS classes

## Testing Guidelines

1. Test chip states:

   - Default render
   - With/without icon
   - With/without close button
   - Different colors and sizes

2. Test interactions:

   - Click events
   - Close button
   - Filter selection
   - Disabled state

3. Test accessibility:

   - Keyboard navigation
   - ARIA attributes
   - Focus management

4. Example test:

```tsx
describe('Chip', () => {
  it('handles close event', () => {
    const onClose = jest.fn();
    render(<Chip label="Test" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button"));
    expect(onClose).toHaveBeenCalled();
  });
});
```
