import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

export interface ContentSection {
  title: string;
  content: string | Record<string, unknown>;
  isForm?: boolean;
  onValueChange?: (key: string, value: unknown) => void;
  values?: Record<string, unknown>;
}

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: ContentSection[];
  primaryAction?: {
    label: string;
    loadingLabel: string;
    onClick: () => void;
    isLoading: boolean;
  };
}

export function ContentModal({
  isOpen,
  onClose,
  title,
  sections,
  primaryAction,
}: ContentModalProps) {
  const renderContent = (section: ContentSection) => {
    if (section.isForm && typeof section.content === "object") {
      return (
        <div className="space-y-4">
          {Object.entries(section.content).map(([key, value]) => (
            <Input
              key={key}
              label={key}
              placeholder={String(value)}
              value={String(section.values?.[key] || "")}
              onChange={(e) => section.onValueChange?.(key, e.target.value)}
            />
          ))}
        </div>
      );
    }

    if (typeof section.content === "string") {
      return (
        <pre className="whitespace-pre-wrap text-sm">{section.content}</pre>
      );
    }

    return (
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(section.content, null, 2)}
      </pre>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg  mb-2">{section.title}</h3>
                    {renderContent(section)}
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                startContent={
                  <Icon icon="solar:close-circle-line-duotone" width={20} />
                }
                className="min-w-[100px]"
              >
                Close
              </Button>
              {primaryAction && (
                <Button
                  startContent={<Icon icon="solar:play-circle-line-duotone" />}
                  color="primary"
                  className="gap-unit-1"
                  isLoading={primaryAction.isLoading}
                  onPress={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
