import { forwardRef } from "react";
import { DynamicButton } from "./DynamicButton";
import type { ButtonProps } from "@nextui-org/react";

interface RefreshButtonProps extends Omit<ButtonProps, "children"> {
  loading?: boolean;
}

export const RefreshButton = forwardRef<HTMLButtonElement, RefreshButtonProps>(
  ({ loading = false, ...props }, ref) => {
    return (
      <DynamicButton
        ref={ref}
        icon="solar:refresh-circle-line-duotone"
        state={loading ? "loading" : "idle"}
        label="Refresh"
        loadingLabel="Refreshing..."
        {...props}
      />
    );
  }
);

RefreshButton.displayName = "RefreshButton";
