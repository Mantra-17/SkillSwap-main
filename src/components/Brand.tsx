import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: {
    mark: "h-7 w-7",
    text: "text-lg",
  },
  md: {
    mark: "h-9 w-9",
    text: "text-xl",
  },
  lg: {
    mark: "h-12 w-12",
    text: "text-2xl",
  },
};

type BrandProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  markClassName?: string;
};

export function Brand({
  size = "md",
  showText = true,
  className,
  textClassName,
  markClassName,
}: BrandProps) {
  return (
    <Link
      to="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="SkillSwap home"
    >
      <span
        className={cn(
          "grid place-items-center rounded-2xl bg-foreground/5 p-2",
          sizeStyles[size].mark,
          markClassName
        )}
      >
        <img
          src="/logo.svg"
          alt="SkillSwap"
          className="h-full w-full"
          loading="eager"
        />
      </span>
      {showText && (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            sizeStyles[size].text,
            textClassName
          )}
        >
          SkillSwap
        </span>
      )}
    </Link>
  );
}
