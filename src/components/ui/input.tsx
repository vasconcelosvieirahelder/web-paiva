import type { InputHTMLAttributes } from "react";
import { shouldUseNativeSpellCheck } from "@/i18n/text-input";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const type = typeof props.type === "string" ? props.type : "text";
  const spellCheck = props.spellCheck ?? shouldUseNativeSpellCheck(type);

  return (
    <input
      className={`h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 ${className}`}
      spellCheck={spellCheck}
      {...props}
    />
  );
}
