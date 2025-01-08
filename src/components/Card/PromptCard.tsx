// Remove React import since it's not needed
import { ToolCard } from "@/components/Card";
import { ExecuteButton, Button } from "@/components/Button";

interface Prompt {
  name: string;
  description?: string;
  type?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onExecute: () => void;
  onView: () => void;
  isLoading?: boolean;
}

export function PromptCard({
  prompt,
  onExecute,
  onView,
  isLoading = false,
}: PromptCardProps) {
  return (
    <div className="flex flex-col" data-testid={`prompt-card-${prompt.name}`}>
      <ToolCard
        name={prompt.name}
        description={prompt.description}
        type={prompt.type || "Prompt"}
      />
      <div className="flex gap-2 mt-2">
        <ExecuteButton
          size="sm"
          onPress={onExecute}
          loading={isLoading}
          label="Execute Prompt"
          loadingLabel="Executing..."
          data-testid={`prompt-execute-${prompt.name}`}
        />
        <Button
          size="sm"
          variant="flat"
          onPress={onView}
          data-testid="view-prompt-button"
        >
          View Prompt
        </Button>
      </div>
    </div>
  );
}
