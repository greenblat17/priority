import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Modern input styling with beautiful focus
        "flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm",
        "transition-all duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "hover:border-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
