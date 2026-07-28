import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sizeClasses = {
  sm:   "max-w-3xl",
  md:   "max-w-5xl",
  lg:   "max-w-7xl",
  xl:   "max-w-screen-2xl",
  full: "max-w-none",
};

/**
 * Layout container with consistent horizontal padding.
 * Wrap page sections in this to keep content aligned.
 *
 * @param {object} props
 * @param {React.ElementType} [props.as="div"]
 * @param {"sm"|"md"|"lg"|"xl"|"full"} [props.size="lg"]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Container({ as: Tag = "div", size = "lg", className, children }) {
  return (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </Tag>
  );
}
