import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-[3px]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "dialog-content fixed top-1/2 left-1/2 z-[51] max-h-[calc(100dvh-48px)] w-[calc(100%-32px)] max-w-[560px] animate-dialog-in rounded-[14px] border border-line bg-surface shadow-[0_25px_100px_#00000030] outline-none [transform:translate(-50%,-50%)] max-[700px]:max-h-[calc(100dvh-24px)] max-[700px]:w-[calc(100%-20px)] max-[700px]:rounded-[11px]",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute top-[18px] right-[18px] z-[2] flex size-7 min-h-10 min-w-10 items-center justify-center rounded-[5px] text-secondary hover:bg-soft"
        aria-label="Close dialog"
      >
        <X size={19} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";
