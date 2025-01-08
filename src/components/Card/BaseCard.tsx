import {
  Card as NextUICard,
  CardBody,
  CardHeader,
  CardProps as NextUICardProps,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import React from "react";

export interface BaseCardProps
  extends Omit<NextUICardProps, "children" | "title"> {
  icon?: string;
  iconClassName?: string;
  iconTestId?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  isEmpty?: boolean;
  emptyComponent?: React.ReactNode;
  "data-testid"?: string;
}

export function BaseCard({
  icon,
  iconClassName,
  iconTestId,
  title,
  subtitle,
  headerAction,
  headerClassName = "",
  bodyClassName = "",
  children,
  isLoading = false,
  loadingComponent,
  isEmpty = false,
  emptyComponent,
  className = "",
  "data-testid": testId,
  ...props
}: BaseCardProps) {
  if (isLoading) {
    return (
      <NextUICard
        className={`bg-default-50 ${className}`}
        data-testid={testId}
        {...props}
      >
        <CardBody>
          {loadingComponent || (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="h-7 w-3/4 bg-default-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-default-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-4 w-full bg-default-100 rounded animate-pulse" />
              <div className="h-9 w-full bg-default-200 rounded-lg animate-pulse mt-1" />
            </div>
          )}
        </CardBody>
      </NextUICard>
    );
  }

  if (isEmpty) {
    return (
      <NextUICard
        className={`bg-default-50 ${className}`}
        data-testid={testId}
        {...props}
      >
        <CardBody>
          {emptyComponent || (
            <div className="flex flex-col items-center justify-center p-6 text-default-400">
              <Icon
                icon="solar:box-minimalistic-broken"
                className="h-12 w-12 mb-2"
              />
              <p>No content available</p>
            </div>
          )}
        </CardBody>
      </NextUICard>
    );
  }

  const hasHeader = title || subtitle || headerAction || icon;

  return (
    <NextUICard
      className={`bg-default-50 ${className}`}
      data-testid={testId}
      {...props}
    >
      {hasHeader && (
        <CardHeader
          className={`flex flex-row items-center justify-between ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <Icon
                data-testid={iconTestId}
                data-icon={icon}
                icon={icon}
                width={24}
                className={`flex-none ${iconClassName || "text-[#f6933c]"}`}
              />
            )}
            {(title || subtitle) && (
              <div>
                {title &&
                  (typeof title === "string" ? (
                    <h3 className="text-lg ">{title}</h3>
                  ) : (
                    title
                  ))}
                {subtitle &&
                  (typeof subtitle === "string" ? (
                    <p className="text-sm text-default-500">{subtitle}</p>
                  ) : (
                    subtitle
                  ))}
              </div>
            )}
          </div>
          {headerAction}
        </CardHeader>
      )}
      <CardBody className={bodyClassName}>{children}</CardBody>
    </NextUICard>
  );
}
