# Button Components

## Overview

Button components provide consistent, reusable button interfaces throughout the application.

## Available Components

### BaseButton

The foundation button component with configurable styles and behaviors.

```tsx
<Button
  icon="icon-name"
  iconPosition="start"
  loading={false}
  loadingText="Processing..."
  color="primary"
>
  Button Text
</Button>
```

### IconButton

Button variant optimized for icon-only interactions.

```tsx
<IconButton icon="refresh" label="Refresh Data" onClick={() => {}} />
```

### ConnectButton

Specialized button for connection state management.

```tsx
<ConnectButton
  isConnected={isConnected}
  isConnecting={isConnecting}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
/>
```

### RefreshButton

Convenience button for refresh operations.

```tsx
<RefreshButton onPress={handleRefresh} loading={isLoading} />
```

## Props

### BaseButton Props

- `icon?: string` - Optional icon name
- `iconPosition?: 'start' | 'end'` - Icon placement
- `loading?: boolean` - Loading state
- `loadingText?: string` - Text during loading
- `color?: ButtonColor` - Button color variant
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `disabled?: boolean` - Disabled state
- `className?: string` - Additional CSS classes

### IconButton Props

- `icon: string` - Required icon name
- `label: string` - Accessibility label
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `onClick?: () => void` - Click handler

### ConnectButton Props

- `isConnected: boolean` - Connection state
- `isConnecting: boolean` - Connecting state
- `onConnect: () => void` - Connect handler
- `onDisconnect: () => void` - Disconnect handler
- `connectMessage?: string` - Custom connect text
- `disconnectMessage?: string` - Custom disconnect text

## Testing Guidelines

1. Test all button states:

   - Default
   - Hover
   - Active
   - Disabled
   - Loading

2. Test accessibility:

   - Keyboard navigation
   - Screen reader compatibility
   - ARIA attributes

3. Test click handlers and state changes

4. Example test:

```tsx
describe("Button", () => {
  it("handles click events", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(onClick).toHaveBeenCalled();
  });
});
```
