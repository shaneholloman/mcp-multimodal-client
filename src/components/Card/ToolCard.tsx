import { Card, CardBody, Chip } from "@nextui-org/react";
import { ExecuteButton } from "../Button";

export interface ToolCardProps {
  /** The name/title of the tool */
  name?: string;
  /** A description of what the tool does */
  description?: string;
  /** The type/category of the tool (displayed in chip) */
  type?: string;
  /** Whether the card is in a loading state */
  isLoading?: boolean;
  /** Whether the card represents an empty state */
  isEmpty?: boolean;
  /** Callback function when the execute button is clicked */
  onExecute?: () => void;
  /** Custom label for the execute button */
  actionLabel?: string;
  /** Additional class names for the card */
  className?: string;
  /** Children components to render inside the card */
  children?: React.ReactNode;
}

/**
 * A card component for displaying tool information with loading, empty, and interactive states.
 * Used throughout the application to represent various tools and actions available to users.
 */
export function ToolCard({
  name,
  description,
  type = "Tool",
  isLoading = false,
  isEmpty = false,
  onExecute,
  actionLabel = "Execute Tool",
  className = "",
  children,
}: ToolCardProps) {
  if (isLoading) {
    return (
      <Card className={`bg-default-50 ${className}`}>
        <CardBody>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="h-7 w-3/4 bg-default-200 rounded animate-pulse" />
              <div className="h-5 w-16 bg-default-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-full bg-default-100 rounded animate-pulse" />
            <div className="h-9 w-full bg-default-200 rounded-lg animate-pulse mt-1" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={`bg-default-50 ${className}`}>
        <CardBody>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="h-7 bg-default-50" />
              <Chip size="sm" variant="flat" color="default">
                Empty
              </Chip>
            </div>
            <div className="h-4 bg-default-50" />
            <div className="h-9 bg-default-50" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-default-50 hover:bg-default-100 transition-colors ${className}`}
    >
      <CardBody>
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            {name && <h3 className="text-lg font-semibold">{name}</h3>}
            <Chip size="sm" variant="flat" color="primary">
              {type}
            </Chip>
          </div>
          {description && (
            <p className="text-small text-default-500">{description}</p>
          )}
          {children}
          {onExecute && (
            <ExecuteButton
              variant="flat"
              onPress={onExecute}
              className="mt-2"
              label={actionLabel}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default ToolCard;
