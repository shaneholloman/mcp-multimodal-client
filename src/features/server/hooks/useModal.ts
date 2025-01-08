import { useState } from "react";

export type ModalMode = "view" | "execute" | null;

interface UseModalReturn {
  isOpen: boolean;
  mode: ModalMode;
  open: (
    mode: Exclude<ModalMode, null>,
    options?: {
      title?: string;
      description?: string;
      parameters?: Record<string, { type: string; description?: string }>;
      onSubmit?: (params: Record<string, unknown>) => Promise<void>;
    }
  ) => void;
  close: () => void;
  options?: {
    title?: string;
    description?: string;
    parameters?: Record<string, { type: string; description?: string }>;
    onSubmit?: (params: Record<string, unknown>) => Promise<void>;
  };
}

export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);
  const [options, setOptions] = useState<{
    title?: string;
    description?: string;
    parameters?: Record<string, { type: string; description?: string }>;
    onSubmit?: (params: Record<string, unknown>) => Promise<void>;
  }>();

  const open = (
    newMode: Exclude<ModalMode, null>,
    newOptions?: {
      title?: string;
      description?: string;
      parameters?: Record<string, { type: string; description?: string }>;
      onSubmit?: (params: Record<string, unknown>) => Promise<void>;
    }
  ) => {
    setMode(newMode);
    setIsOpen(true);
    setOptions(newOptions);
  };

  const close = () => {
    setIsOpen(false);
    setMode(null);
    setOptions(undefined);
  };

  return {
    isOpen,
    mode,
    open,
    close,
    options,
  };
}
