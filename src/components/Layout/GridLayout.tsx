import React from "react";

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;
type GridGap = 2 | 3 | 4 | 5 | 6 | 8;
type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

interface GridBreakpoint {
  cols?: GridColumns;
  gap?: GridGap;
}

export interface GridLayoutProps {
  children: React.ReactNode;
  className?: string;
  cols?: GridColumns;
  gap?: GridGap;
  responsive?: Partial<Record<Breakpoint, GridBreakpoint>>;
}

export function GridLayout({
  children,
  className = "",
  cols = 1,
  gap = 4,
  responsive,
}: GridLayoutProps) {
  const getResponsiveClasses = () => {
    if (!responsive) return "";

    return Object.entries(responsive)
      .map(([breakpoint, config]) => {
        const classes = [];
        if (config.cols) {
          classes.push(`${breakpoint}:grid-cols-${config.cols}`);
        }
        if (config.gap) {
          classes.push(`${breakpoint}:gap-${config.gap}`);
        }
        return classes.join(" ");
      })
      .join(" ");
  };

  return (
    <div
      className={`grid grid-cols-${cols} gap-${gap} ${getResponsiveClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

// Preset layouts for common use cases
export function TwoColumnLayout({
  children,
  className = "",
  gap = 6,
}: Omit<GridLayoutProps, "cols" | "responsive">) {
  return (
    <GridLayout
      cols={1}
      gap={gap}
      responsive={{
        md: { cols: 2 },
      }}
      className={className}
    >
      {children}
    </GridLayout>
  );
}

export function ThreeColumnLayout({
  children,
  className = "",
  gap = 6,
}: Omit<GridLayoutProps, "cols" | "responsive">) {
  return (
    <GridLayout
      cols={1}
      gap={gap}
      responsive={{
        md: { cols: 2 },
        lg: { cols: 3 },
      }}
      className={className}
    >
      {children}
    </GridLayout>
  );
}

export function FourColumnLayout({
  children,
  className = "",
  gap = 6,
}: Omit<GridLayoutProps, "cols" | "responsive">) {
  return (
    <GridLayout
      cols={1}
      gap={gap}
      responsive={{
        sm: { cols: 2 },
        lg: { cols: 3 },
        xl: { cols: 4 },
      }}
      className={className}
    >
      {children}
    </GridLayout>
  );
}
