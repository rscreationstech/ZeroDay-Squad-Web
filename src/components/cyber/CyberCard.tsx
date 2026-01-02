import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glow" | "terminal";
  style?: CSSProperties;
}

export function CyberCard({
  children,
  className,
  variant = "default",
  style,
}: CyberCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card/80 backdrop-blur-sm p-6 transition-all duration-300",
        "border border-primary/30 hover:border-primary/60",
        variant === "glow" && "cyber-glow",
        variant === "terminal" && "font-mono",
        className
      )}
      style={{
        clipPath:
          "polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))",
        ...style,
      }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/60" />

      {variant === "terminal" && (
        <div className="absolute top-2 left-4 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <div className="w-2 h-2 rounded-full bg-secondary/80" />
        </div>
      )}

      <div className={cn(variant === "terminal" && "mt-4")}>{children}</div>
    </div>
  );
}
