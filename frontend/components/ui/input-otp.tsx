// components/ui/input-otp.tsx
"use client";

import * as React from "react";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 1) Context for sharing slot state
 */
export const OTPInputContext = React.createContext<{
  slots: { char: string; hasFakeCaret: boolean; isActive: boolean }[];
}>({ slots: [] });

/**
 * 2) Base OTPInput component:
 *    - Renders a div wrapper with containerClassName
 *    - Renders an <input> with className
 *    - Provides a default empty slots array
 */
export type OTPInputProps = React.ComponentPropsWithoutRef<"input"> & {
  containerClassName?: string;
  className?: string;
};
export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  ({ containerClassName, className, ...props }, ref) => (
    <OTPInputContext.Provider value={{ slots: [] }}>
      <div ref={ref as any} className={containerClassName}>
        <input ref={ref} className={className} {...props} />
      </div>
    </OTPInputContext.Provider>
  )
);
OTPInput.displayName = "OTPInput";

/**
 * 3) InputOTP – your styled wrapper around OTPInput
 */
export const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

/**
 * 4) InputOTPGroup – container for multiple slots/separators
 */
export const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

/**
 * 5) InputOTPSlot – renders a single slot from context.slots
 */
export const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const { slots } = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = slots[index] || {
    char: "",
    hasFakeCaret: false,
    isActive: false,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

/**
 * 6) InputOTPSeparator – renders the Dot icon as a separator
 */
export const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";
