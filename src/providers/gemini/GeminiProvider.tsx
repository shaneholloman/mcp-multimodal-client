import { ReactNode } from "react";
import { useGeminiProvider } from "./hook";

interface Props {
  children: ReactNode;
}

export function GeminiProvider({ children }: Props) {
  useGeminiProvider();
  return <>{children}</>;
}
