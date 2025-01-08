# Server Features

## Core Concepts

### Hooks Architecture

1. `useModal` - Modal State Management

   - Opens/closes modal
   - Manages modal mode (view/execute)
   - Handles modal actions

2. `useParameters` - Parameter Management

   - Manages parameter values
   - Handles validation
   - Provides parameter update methods

3. `useMcpPrompt` - MCP Operations

   - Handles MCP client availability
   - Fetches prompt details
   - Executes MCP operations
   - Manages connection status (connected/pending/disconnected)

4. `useLlmPrompt` - LLM Operations

   - Manages LLM provider
   - Executes prompts via LLM
   - Handles LLM responses
   - Validates message availability

5. `usePromptLogger` - Logging

   - Records operations
   - Manages execution history
   - Provides logging utilities
   - Supports success/error logging

6. `usePromptExecution` - Prompt Execution Management

   - Manages prompt selection state
   - Handles parameter validation
   - Controls execution flow
   - Provides error handling

7. `useServer` - Server Management
   - Manages server connection state
   - Handles server capabilities
   - Provides unified server interface
   - Manages prompt and resource operations

### Flow Diagrams

#### View Prompt Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant Modal as Modal Manager
    participant Params as Parameter Manager
    participant MCP as MCP Client
    participant Log as Logger

    UI->>Modal: Click View Prompt
    Modal->>MCP: Check Client Available
    MCP-->>Modal: Client Ready
    Modal->>UI: Open Modal
    UI->>Params: Input Parameters
    Params->>Params: Validate
    UI->>MCP: Submit (getPrompt)
    MCP-->>Log: Record Result
    MCP-->>Modal: Close on Success
```

#### Execute Prompt Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant Modal as Modal Manager
    participant Params as Parameter Manager
    participant MCP as MCP Client
    participant LLM as LLM Provider
    participant Log as Logger

    UI->>Modal: Click Execute Prompt
    Modal->>MCP: Check Client Available
    MCP-->>Modal: Client Ready
    Modal->>UI: Open Modal
    UI->>Params: Input Parameters
    Params->>Params: Validate
    UI->>MCP: Get Prompt Details
    MCP->>LLM: Execute with Parameters
    LLM-->>Log: Record Result
    LLM-->>Modal: Close on Success
```

### Component Integration

```mermaid
graph TD
    A[PromptsSection] -->|Uses| B[useModal]
    A -->|Uses| C[useParameters]
    A -->|Uses| D[useMcpPrompt]
    A -->|Uses| E[useLlmPrompt]
    A -->|Uses| F[usePromptLogger]

    B -->|Controls| G[PromptModal]
    C -->|Validates| G
    D -->|Provides Data| G
    E -->|Executes| G
    F -->|Records| H[ExecutionHistory]
```

## Implementation Details

### State Management

Each hook maintains its own isolated state:

- Modal: `isOpen`, `mode`
- Parameters: `values`, `errors`
- MCP: `client`, `status`
- LLM: `provider`, `status`
- Logger: `history`, `operations`

### Error Handling

1. Client Availability

   ```typescript
   if (!clientState?.client) {
     throw new Error("No MCP client available");
   }
   ```

2. Parameter Validation

   ```typescript
   const errors: ValidationError[] = [];
   if (!selectedPrompt?.inputSchema) return errors;

   const { required = [] } = selectedPrompt.inputSchema;
   required.forEach((key) => {
     if (!promptParams[key] || promptParams[key].trim() === "") {
       errors.push({
         path: [key],
         message: `${key} is required`,
       });
     }
   });
   ```

3. Operation Results
   ```typescript
   try {
     const result = await onExecutePrompt(selectedPrompt.name, promptParams);
     addLog({
       type: "prompt",
       operation: "Execute Prompt",
       status: "success",
       name: selectedPrompt.name,
       params: promptParams,
       result,
     });
   } catch (error) {
     addLog({
       type: "prompt",
       operation: "Execute Prompt",
       status: "error",
       name: selectedPrompt.name,
       params: promptParams,
       error: error instanceof Error ? error.message : "An error occurred",
     });
   }
   ```

### Testing Strategy

1. Unit Tests

   - Individual hook behavior
   - Parameter validation
   - Error handling

2. Integration Tests

   - Hook interactions
   - Flow completion
   - Error propagation

3. E2E Tests
   - Complete view flow
   - Complete execute flow
   - Error scenarios

## Usage Example

```typescript
// Example of hook composition in PromptsSection
function PromptsSection({ onExecutePrompt, onGetPromptDetails }) {
  // Core hooks
  const modal = useModal();
  const params = useParameters();

  // Composed hooks
  const promptExecution = usePromptExecution({
    onExecutePrompt,
    onGetPromptDetails,
  });

  const handleSubmit = async () => {
    if (!params.validate(selectedPrompt?.inputSchema)) {
      return;
    }

    const success = await promptExecution.executePrompt();
    if (success) {
      modal.close();
      params.reset();
    }
  };

  return (
    <PromptModal
      isOpen={modal.isOpen}
      onClose={() => {
        modal.close();
        params.reset();
      }}
      parameters={promptExecution.selectedPrompt?.inputSchema?.properties}
      parameterValues={params.values}
      onParameterChange={params.setValue}
      validationErrors={params.errors}
    />
  );
}

### Hook Composition

The server features use a layered hook architecture:

1. Base Hooks
   - `useModal`, `useParameters`, `useMcpPrompt`, `useLlmPrompt`, `usePromptLogger`
   - Handle fundamental operations and state management

2. Composed Hooks
   - `usePromptExecution` - Combines parameter, validation, and execution logic
   - `usePrompts` - Orchestrates modal, parameter, and prompt execution flows
   - `useServer` - Provides unified server interface using multiple base hooks

3. Context Hooks
   - `useGlobalLlm` - Provides LLM context to `useLlmPrompt`
   - `useLogStore` - Provides logging context to various hooks

This layered approach allows for:
- Separation of concerns
- Reusable core functionality
- Flexible composition for different use cases
- Consistent state management
```
