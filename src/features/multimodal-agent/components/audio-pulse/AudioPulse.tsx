import cn from "classnames";
import { useEffect, useRef } from "react";

const lineCount = 3;

export type AudioPulseProps = {
  active: boolean;
  volume: number;
  hover?: boolean;
};

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach(
        (line, i) =>
          (line.style.height = `${Math.min(
            24,
            4 + volume * (i === 1 ? 400 : 60)
          )}px`)
      );
      timeout = window.setTimeout(update, 100);
    };

    update();
    return () => clearTimeout((timeout as number)!);
  }, [volume]);

  return (
    <div
      className={cn(
        "flex w-12 h-6 justify-evenly items-center transition-all duration-300 ease-in-out",
        active ? "opacity-100" : "opacity-70"
      )}
    >
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) lines.current[i] = el;
            }}
            className={cn(
              "w-1.5 min-h-1.5 rounded-full transition-all duration-200 ease-out transform-gpu",
              active ? "bg-default-800 animate-pulse" : "bg-default-300",
              hover && "animate-hover"
            )}
            style={{
              animationDelay: `${i * 133}ms`,
            }}
          />
        ))}
    </div>
  );
}
