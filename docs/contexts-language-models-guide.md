# Context Implementation Standards

## Code Organization

### File Structure

```
contexts/
├── __llm__/          # Documentation
├── [Name]Context.tsx  # Context definition
├── [Name]Context.types.ts  # Type definitions
└── [Name]Provider.tsx # Provider implementation
```

### File Naming

- Use PascalCase for context and provider files
- Append `Context` to context files
- Append `Provider` to provider files
- Use `.types.ts` for type definition files

## Type Definitions

1. Always define explicit interfaces for:

   - Context value
   - Provider props
   - State objects
   - Configuration objects

2. Use TypeScript features:
   ```typescript
   // Example
   export interface ContextValue {
     state: State;
     dispatch: Dispatch<Action>;
   }
   ```

## Context Implementation

### Creation

```typescript
const MyContext = createContext<ContextValue | null>(null);

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
};
```

### Provider Pattern

```typescript
export const MyProvider: FC<PropsWithChildren> = ({ children }) => {
  // State management
  // Effect handling
  // Method implementations

  const value = useMemo(
    () => ({
      // Context value
    }),
    [
      /* dependencies */
    ]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
```

## Error Handling

1. Use custom error classes
2. Implement error boundaries
3. Provide meaningful error messages
4. Handle async errors properly

```typescript
class ContextError extends Error {
  constructor(message: string) {
    super(`[ContextName] ${message}`);
  }
}
```

## State Management

1. Use appropriate React hooks:

   - `useState` for simple state
   - `useReducer` for complex state
   - `useMemo` for computed values
   - `useCallback` for methods

2. Optimize renders:
   ```typescript
   const value = useMemo(
     () => ({
       state,
       methods,
     }),
     [state]
   );
   ```

## Method Implementation

1. Async methods:

   ```typescript
   const handleAction = async () => {
     try {
       // Implementation
     } catch (error) {
       handleError(error);
     }
   };
   ```

2. Event handlers:
   ```typescript
   const handleEvent = useCallback(
     (event) => {
       // Implementation
     },
     [
       /* dependencies */
     ]
   );
   ```

## Documentation

1. Use JSDoc for:

   - Context definitions
   - Public methods
   - Type definitions
   - Complex logic

2. Example:
   ```typescript
   /**
    * Manages the connection to an MCP server
    * @param serverId - Unique identifier for the server
    * @returns Promise that resolves when connected
    * @throws {ConnectionError} When connection fails
    */
   const connectServer = async (serverId: string) => {
     // Implementation
   };
   ```

## Testing

1. Test files:

   - `__tests__/[Name].test.tsx`
   - Include unit and integration tests
   - Test error scenarios

2. Test structure:
   ```typescript
   describe("MyContext", () => {
     it("provides expected value", () => {
       // Test implementation
     });
   });
   ```

## Performance

1. Memoization guidelines:

   - Memoize complex calculations
   - Memoize callback functions
   - Avoid unnecessary re-renders

2. State updates:
   - Batch related updates
   - Use functional updates
   - Optimize dependencies

## Security

1. Input validation
2. Secure storage of sensitive data
3. Safe error handling
4. Proper cleanup
