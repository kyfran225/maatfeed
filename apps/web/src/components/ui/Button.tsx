import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary";
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyles = "rounded-full px-4 py-2 font-medium transition";
  const variantStyles = variant === "primary"
    ? "bg-ember text-white hover:bg-gold hover:text-ink"
    : "border border-white/20 bg-white/5 text-sand hover:bg-white/10";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
