# Modal Component

## Overview

The Modal component provides a reusable overlay dialog that can be used to display content on top of the main application. It handles accessibility, keyboard interactions, and backdrop clicks.

## Available Variants

- Standard Modal
- Full Screen Modal
- Side Panel Modal

## Props and Configuration

| Prop     | Type                           | Default  | Description                    |
| -------- | ------------------------------ | -------- | ------------------------------ |
| isOpen   | boolean                        | false    | Controls modal visibility      |
| onClose  | function                       | required | Callback when modal closes     |
| children | ReactNode                      | required | Content to render inside modal |
| title    | string                         | ''       | Modal header title             |
| size     | 'sm' \| 'md' \| 'lg' \| 'full' | 'md'     | Controls modal size            |
| position | 'center' \| 'right'            | 'center' | Modal position on screen       |

## Usage Examples

```jsx
// Basic usage
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content goes here</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>

// Full screen modal
<Modal isOpen={isOpen} onClose={handleClose} size="full">
  {/* Modal content */}
</Modal>
```

## Testing Guidelines

1. Test modal open/close functionality
2. Verify backdrop click behavior
3. Test keyboard interactions (Esc key)
4. Check accessibility features:
   - Focus trap inside modal
   - ARIA attributes
   - Screen reader compatibility
5. Test different sizes and positions
