import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HexagonCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary";
  onClick?: () => void;
}

export function HexagonCard({
  children,
  className,
  glowColor = "primary",
  onClick,
}: HexagonCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer",
        onClick && "hover:scale-105 transition-transform duration-300",
        className
      )}
    >
      {/* Outer glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
          glowColor === "primary" ? "bg-primary/30" : "bg-secondary/30"
        )}
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />

      {/* Card container */}
      <div
        className={cn(
          "relative bg-card/90 backdrop-blur-sm p-6 transition-all duration-300",
          "border border-primary/30 group-hover:border-primary/60",
          glowColor === "secondary" && "border-secondary/30 group-hover:border-secondary/60"
        )}
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        {/* Inner content */}
        <div className="relative z-10">{children}</div>

        {/* Corner accents */}
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1",
            glowColor === "primary" ? "bg-primary/50" : "bg-secondary/50"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1",
            glowColor === "primary" ? "bg-primary/50" : "bg-secondary/50"
          )}
        />
      </div>
    </div>
  );
}
