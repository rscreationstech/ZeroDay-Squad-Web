import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block",
        className
      )}
    >
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 text-primary opacity-80"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
          animation: "glitch-top 2s infinite",
        }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 text-secondary opacity-80"
        style={{
          clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
          animation: "glitch-bottom 2s infinite",
        }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}
