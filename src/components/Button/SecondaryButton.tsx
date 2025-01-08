import { Button, ButtonProps } from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface SecondaryButtonProps extends Omit<ButtonProps, "variant"> {
  icon?: string;
  iconClassName?: string;
}

export function SecondaryButton({
  children,
  icon,
  iconClassName = "",
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <Button
      variant="bordered"
      className={`bg-success-50/30 border-success-200 text-success-700 hover:bg-success-100/30 ${
        props.isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      startContent={
        icon && <Icon icon={icon} className={`h-4 w-4 ${iconClassName}`} />
      }
      {...props}
    >
      {children}
    </Button>
  );
}
