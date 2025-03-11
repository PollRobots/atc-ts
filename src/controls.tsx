import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const BUTTON_CLASS_NAME =
  "bg-blue-500 text-white dark:text-black font-medium py-1 px-2 rounded";
const BUTTON_TEXT = "text-xs  md:text-sm lg:text-base xl:text-lg";
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
        BUTTON_TEXT,
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

type SelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const SELECT_CLASS_NAME =
  "bg-gray-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
const SELECT_TEXT = "text-xs sm:text-sm md:text-base lg:text-lg";
const SELECT_PADDING = "p-0.5 sm:p-1 md:p-1.5 lg:p-2";

export function Select({
  id,
  value,
  onChange,
  disabled,
  children,
  className,
}: SelectProps) {
  return (
    <select
      className={twMerge(
        SELECT_CLASS_NAME,
        SELECT_TEXT,
        SELECT_PADDING,
        className
      )}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {" "}
      {children}
    </select>
  );
}
