import React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <div className="relative inline-block h-6 w-11">
      <input
        type="checkbox"
        className={cn(
          "peer h-full w-full shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-gray-200 checked:bg-violet-600",
          className
        )}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          "peer-checked:translate-x-5 translate-x-0"
        )}
      />
    </div>
  );
}
