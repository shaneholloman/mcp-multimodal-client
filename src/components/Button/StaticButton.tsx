import { forwardRef } from "react";
import { motion } from "framer-motion";
import { BaseButton, BaseButtonProps } from "./BaseButton";

export interface StaticButtonProps extends BaseButtonProps {
  instant?: boolean;
}

export const StaticButton = forwardRef<HTMLButtonElement, StaticButtonProps>(
  ({ instant = true, className = "", label, ...props }, ref) => {
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
          label={label}
          {...props}
        />
      </motion.div>
    );
  }
);

StaticButton.displayName = "StaticButton";
