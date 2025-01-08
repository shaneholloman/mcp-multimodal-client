import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button as BaseButton } from "@nextui-org/react";
import type { ButtonProps as BaseButtonProps } from "@nextui-org/react";

export interface DynamicButtonProps extends BaseButtonProps {
  state?: "idle" | "loading" | "success" | "error";
  pulseOnSuccess?: boolean;
  successIcon?: string;
  errorIcon?: string;
  successLabel?: string;
  errorLabel?: string;
  icon?: string;
  className?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  label?: string;
  loadingLabel?: string;
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
          return icon;
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
        case "loading":
          return "bg-success-500";
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
          loading={state === "loading"}
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
