import { forwardRef } from "react";
import { DynamicButton } from "./DynamicButton";
import type { ButtonProps } from "@nextui-org/react";

interface ExecuteButtonProps extends Omit<ButtonProps, "children"> {
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
}

export const ExecuteButton = forwardRef<HTMLButtonElement, ExecuteButtonProps>(
  (
    {
      loading = false,
      label = "Execute",
      loadingLabel = "Executing...",
      ...props
    },
    ref
  ) => {
    return (
      <DynamicButton
        ref={ref}
        icon="solar:bolt-circle-line-duotone"
        state={loading ? "loading" : "idle"}
        label={label}
        loadingLabel={loadingLabel}
        data-testid="execute-prompt-button"
        {...props}
      >
        {label}
      </DynamicButton>
    );
  }
);

ExecuteButton.displayName = "ExecuteButton";
