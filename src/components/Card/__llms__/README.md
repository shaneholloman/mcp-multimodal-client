# Card Components

## Overview

Card components provide consistent containers for displaying grouped content with various layouts and purposes.

## Available Components

### BaseCard

Foundation card component with header, content, and action areas.

```tsx
<BaseCard
  icon="icon-name"
  iconClassName="text-primary"
  title="Card Title"
  subtitle="Optional subtitle"
  headerAction={<Button />}
  isLoading={false}
  isEmpty={false}
>
  {/* Card content */}
</BaseCard>
```

### StatusCard

Card variant for displaying status information and details.

```tsx
<StatusCard
  status="success"
  title="Connection Status"
  description="Server is running"
  icon="server"
  details={[
    { label: "Status", value: "Connected" },
    { label: "Type", value: "Primary" },
  ]}
/>
```

### ToolCard

Specialized card for tool information and actions.

```tsx
<ToolCard
  name="Tool Name"
  description="Tool description"
  type="Tool"
  isLoading={false}
  isEmpty={false}
  onExecute={() => handleExecute()}
/>
```

## Props

### BaseCard Props

- `icon?: string` - Optional header icon
- `iconClassName?: string` - Icon styling
- `title: ReactNode` - Card title
- `subtitle?: ReactNode` - Optional subtitle
- `headerAction?: ReactNode` - Optional header action
- `isLoading?: boolean` - Loading state
- `isEmpty?: boolean` - Empty state
- `children: ReactNode` - Card content

### StatusCard Props

- `status: 'success' | 'warning' | 'danger' | 'default'` - Status type
- `title: string` - Status title
- `description?: string` - Status description
- `icon?: string` - Status icon
- `details?: Array<{label: string, value: string}>` - Detail items

### ToolCard Props

- `name: string` - Tool name
- `description: string` - Tool description
- `type: string` - Tool type
- `isLoading?: boolean` - Loading state
- `isEmpty?: boolean` - Empty state
- `onExecute?: () => void` - Execute handler

## Testing Guidelines

1. Test card states:

   - Default render
   - Loading state
   - Empty state
   - With/without optional elements

2. Test interactions:

   - Header actions
   - Content interactions
   - Tool execution

3. Test accessibility:

   - Heading hierarchy
   - ARIA attributes
   - Keyboard navigation

4. Example test:

```tsx
describe("Card", () => {
  it("renders with title and content", () => {
    render(
      <BaseCard title="Test Card">
        <p>Card content</p>
      </BaseCard>
    );
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});
```
