import { ReactNode } from "react";
import { Accordion, AccordionItem, Card, CardBody } from "@nextui-org/react";

interface AccordionCardProps {
  /** Content to show in the accordion header */
  header: ReactNode;
  /** Content to show in the accordion header when collapsed (optional) */
  collapsedContent?: ReactNode;
  /** Whether the accordion is expanded by default */
  defaultExpanded?: boolean;
  /** The main content of the card */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * A card component that combines Card with an accordion for collapsible content.
 * The header is part of the accordion itself for a more integrated look.
 */
export function AccordionCard({
  header,
  collapsedContent,
  defaultExpanded = false,
  children,
  className = "",
}: AccordionCardProps) {
  return (
    <Card className={className}>
      <CardBody className="p-0 overflow-hidden">
        <Accordion
          defaultExpandedKeys={defaultExpanded ? ["content"] : []}
          selectionMode="single"
          className="px-0"
        >
          <AccordionItem
            key="content"
            aria-label="Card Content"
            classNames={{
              base: "px-0",
              title: "py-3",
              trigger: "px-2 py-0 data-[hover=true]:bg-default-100",
              content: "pt-0 pb-4 px-6",
            }}
            title={
              <div className="flex flex-col gap-1">
                {header}
                {collapsedContent && (
                  <div className="text-sm text-default-500">
                    {collapsedContent}
                  </div>
                )}
              </div>
            }
          >
            {children}
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
