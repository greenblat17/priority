import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Modern textarea styling with beautiful focus
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm",
        "transition-all duration-200 resize-none",
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

export { Textarea }
