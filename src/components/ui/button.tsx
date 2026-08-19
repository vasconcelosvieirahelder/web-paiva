import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClasses =
    variant === "primary"
      ? "bg-teal-700 text-white hover:bg-teal-800"
      : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

