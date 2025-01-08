import {
  Button as NextUIButton,
  ButtonProps as NextUIButtonProps,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { forwardRef } from "react";

// Base Button Types and Component
export interface BaseButtonProps extends NextUIButtonProps {
  icon?: string;
  iconClassName?: string;
  label?: string;
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
      children,
      ...props
    },
    ref
  ) => {
    const displayLabel =
      loading && loadingLabel ? loadingLabel : label || children;
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
        startContent={
          iconPosition === "start" ? iconContent : props.startContent
        }
        endContent={iconPosition === "end" ? iconContent : props.endContent}
        isLoading={loading}
      >
        {displayLabel}
      </NextUIButton>
    );
  }
);

BaseButton.displayName = "BaseButton";

// Static Button - For instant feedback and simple interactions
export interface StaticButtonProps extends BaseButtonProps {
  instant?: boolean;
}

export const StaticButton = forwardRef<HTMLButtonElement, StaticButtonProps>(
  ({ instant = true, className = "", ...props }, ref) => {
    return (
      <motion.div
        whileTap={instant ? { scale: 0.97 } : undefined}
        className="inline-block"
      >
        <BaseButton
          ref={ref}
          className={`
            hover:scale-105 active:scale-100
            transition-transform duration-200
            ${className}
          `}
          {...props}
        />
      </motion.div>
    );
  }
);

StaticButton.displayName = "StaticButton";

// Dynamic Button - For complex state transitions and loading states
export interface DynamicButtonProps extends BaseButtonProps {
  state?: "idle" | "loading" | "success" | "error";
  pulseOnSuccess?: boolean;
  successIcon?: string;
  errorIcon?: string;
  successLabel?: string;
  errorLabel?: string;
}

export const DynamicButton = forwardRef<HTMLButtonElement, DynamicButtonProps>(
  (
    {
      state = "idle",
      pulseOnSuccess = true,
      icon = "solar:power-line-duotone",
      successIcon = "solar:shield-check-line-duotone",
      errorIcon = "solar:shield-warning-line-duotone",
      successLabel,
      errorLabel = "Error",
      className = "",
      color = "primary",
      label,
      loadingLabel,
      ...props
    },
    ref
  ) => {
    const getStateStyles = () => {
      switch (state) {
        case "loading":
          return "bg-default-50/50 border-default-200";
        case "error":
          return "bg-danger-50/50 border-danger-200 hover:bg-danger-100/50";
        case "success":
          return "bg-success-50/50 border-success-200 hover:bg-success-100/50";
        default:
          return "bg-default-50/50 border-default-200 hover:bg-default-100/50";
      }
    };

    const getCurrentIcon = () => {
      switch (state) {
        case "loading":
          return "solar:refresh-circle-line-duotone";
        case "error":
          return errorIcon;
        case "success":
          return successIcon;
        default:
          return icon;
      }
    };

    const getIconColor = () => {
      switch (state) {
        case "loading":
          return "#f6933c";
        case "error":
          return "var(--danger)";
        case "success":
          return "var(--success)";
        default:
          return "#f6933c";
      }
    };

    const getStatusDot = () => {
      switch (state) {
        case "error":
          return "bg-danger-500";
        case "success":
          return `bg-success-500 ${pulseOnSuccess ? "animate-pulse" : ""}`;
        default:
          return "bg-default-500";
      }
    };

    const getCurrentLabel = () => {
      switch (state) {
        case "loading":
          return loadingLabel || "Loading...";
        case "error":
          return errorLabel;
        case "success":
          return successLabel || label;
        default:
          return label;
      }
    };

    const renderIcon = () => (
      <motion.div
        animate={state === "loading" ? { rotate: 360 } : { rotate: 0 }}
        transition={
          state === "loading"
            ? {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }
            : undefined
        }
        className="flex items-center"
      >
        <Icon
          icon={getCurrentIcon()}
          width={24}
          className={`flex-none ${state === "loading" ? "animate-spin" : ""}`}
          color={getIconColor()}
        />
      </motion.div>
    );

    return (
      <motion.div
        animate={state === "loading" ? { scale: 1.05 } : { scale: 1 }}
        className="inline-block"
      >
        <BaseButton
          ref={ref}
          variant="bordered"
          className={`
            group transition-all duration-300
            border rounded-xl
            ${getStateStyles()}
            ${className}
          `}
          loading={false} // We handle loading state manually for custom animation
          disabled={state === "loading"}
          startContent={
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
              {renderIcon()}
            </div>
          }
          color={color}
          label={getCurrentLabel()}
          {...props}
        />
      </motion.div>
    );
  }
);

DynamicButton.displayName = "DynamicButton";
