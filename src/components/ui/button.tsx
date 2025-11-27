import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold font-display uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hologram: "bg-transparent border border-[hsl(var(--hologram)/0.6)] text-[hsl(var(--hologram))] hover:bg-[hsl(var(--hologram)/0.1)] hover:border-[hsl(var(--hologram))] shadow-[0_0_20px_hsl(var(--hologram)/0.2)] hover:shadow-[0_0_30px_hsl(var(--hologram)/0.4)] backdrop-blur-sm",
        credits: "bg-gradient-to-r from-[hsl(var(--credits-gold))] to-[hsl(var(--credits-glow))] text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--credits-gold)/0.5)]",
        imperial: "bg-[hsl(var(--imperial-gray))] text-foreground border border-border hover:bg-[hsl(var(--imperial-gray)/0.8)]",
        hero: "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(220,100%,60%)] text-primary-foreground px-8 py-6 text-base hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
