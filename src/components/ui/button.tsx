import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva(
  "ui-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border border-transparent px-3.5 text-[14px] font-[550] transition-[background,box-shadow] duration-150 disabled:cursor-not-allowed disabled:border-line disabled:bg-soft disabled:text-secondary disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-ink text-surface shadow-[0_2px_3px_#00000016,inset_0_1px_0_#00000013] enabled:hover:shadow-[0_3px_8px_#00000020]",
        outline:
          "border-line bg-surface text-ink shadow-[0_1px_2px_#00000003] enabled:hover:bg-canvas",
        ghost: "text-ink enabled:hover:bg-soft",
        destructive: "bg-ink text-surface",
      },
      size: {
        default: "",
        sm: "min-h-[38px] gap-1.5 px-2.5",
        icon: "size-8 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button, buttonVariants };
