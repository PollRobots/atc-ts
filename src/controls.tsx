import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const BUTTON_CLASS_NAME =
  "bg-blue-500 text-white dark:text-black font-medium text-sm py-1 px-2 rounded";
const BUTTON_ENABLED_CLASS_NAME = "hover:bg-blue-700 dark:hover:bg-blue-400";
const BUTTON_DISABLED_CLASS_NAME = "opacity-50 cursor-not-allowed";

export function Button({
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        BUTTON_CLASS_NAME,
        disabled ? BUTTON_DISABLED_CLASS_NAME : BUTTON_ENABLED_CLASS_NAME,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
