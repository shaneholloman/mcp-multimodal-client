# Logger Components

## Overview

Logger components provide debugging and monitoring interfaces for displaying application logs and debug information.

## Available Components

### LogViewer

Main component for displaying log entries with filtering and search.

```tsx
<LogViewer
  logs={logEntries}
  level="info"
  onClear={() => {}}
  onLevelChange={(level) => {}}
/>
```

### LogEntry

Individual log entry display with timestamp and level.

```tsx
<LogEntry
  timestamp={new Date()}
  level="error"
  message="Error occurred"
  details={{ error: "Details" }}
/>
```

### ConsoleOutput

Terminal-like console output display.

```tsx
<ConsoleOutput lines={outputLines} maxLines={100} autoScroll={true} />
```

## Props

### LogViewer Props

- `logs: LogEntry[]` - Array of log entries
- `level?: LogLevel` - Current filter level
- `onClear?: () => void` - Clear logs handler
- `onLevelChange?: (level: LogLevel) => void` - Level filter handler
- `className?: string` - Additional CSS classes
- `maxHeight?: string | number` - Maximum height of viewer

### LogEntry Props

- `timestamp: Date` - Entry timestamp
- `level: 'debug' | 'info' | 'warn' | 'error'` - Log level
- `message: string` - Log message
- `details?: object` - Additional log details
- `className?: string` - Additional CSS classes

### ConsoleOutput Props

- `lines: string[]` - Output lines
- `maxLines?: number` - Maximum lines to display
- `autoScroll?: boolean` - Auto-scroll to bottom
- `className?: string` - Additional CSS classes
- `monospace?: boolean` - Use monospace font

## Testing Guidelines

1. Test log display:

   - Different log levels
   - Timestamp formatting
   - Message truncation
   - Details expansion

2. Test filtering and search:

   - Level filtering
   - Text search
   - Clear functionality
   - Max lines limit

3. Test accessibility:

   - Keyboard navigation
   - Screen reader support
   - Focus management
   - Color contrast for log levels

4. Example test:

```tsx
describe("LogViewer", () => {
  it("filters logs by level", () => {
    const logs = [
      { level: "error", message: "Error log" },
      { level: "info", message: "Info log" },
    ];
    render(<LogViewer logs={logs} level="error" />);
    expect(screen.getByText("Error log")).toBeInTheDocument();
    expect(screen.queryByText("Info log")).not.toBeInTheDocument();
  });
});
```
