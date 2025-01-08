import {
  Button as NextUIButton,
  ButtonProps as NextUIButtonProps,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { forwardRef } from "react";

export interface BaseButtonProps extends NextUIButtonProps {
  icon?: string;
  iconClassName?: string;
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  iconPosition?: "start" | "end";
  className?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      icon,
      iconClassName = "",
      label,
      loadingLabel,
      loading = false,
      iconPosition = "start",
      className = "",
      ...props
    },
    ref
  ) => {
    const displayLabel = loading && loadingLabel ? loadingLabel : label;
    const iconContent = icon && (
      <Icon icon={icon} width={20} className={`flex-none ${iconClassName}`} />
    );

    return (
      <NextUIButton
        ref={ref}
        className={`
          transition-all duration-200
          ${loading ? "cursor-wait" : ""}
          ${className}
        `}
        {...props}
        startContent={iconPosition === "start" ? iconContent : undefined}
        endContent={iconPosition === "end" ? iconContent : undefined}
        isLoading={loading}
      >
        {displayLabel}
      </NextUIButton>
    );
  }
);

BaseButton.displayName = "BaseButton";
