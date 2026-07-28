import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ── Variant definitions ─────────────────────────────────── */
const variants = {
  primary:
    "bg-wbk-black text-wbk-white hover:bg-wbk-green border border-wbk-black hover:border-wbk-green",
  secondary:
    "bg-transparent text-wbk-black border border-wbk-black hover:bg-wbk-black hover:text-wbk-white",
  gold:
    "bg-wbk-gold text-wbk-black hover:bg-wbk-brown hover:text-wbk-white border border-wbk-gold hover:border-wbk-brown",
  ghost:
    "bg-transparent text-wbk-black hover:text-wbk-green border border-transparent hover:border-wbk-green",
  white:
    "bg-wbk-white text-wbk-black hover:bg-wbk-lightgrey border border-wbk-white hover:border-wbk-lightgrey",
};

const sizes = {
  sm: "px-4 py-2 text-xs tracking-widest",
  md: "px-6 py-3 text-xs tracking-widest",
  lg: "px-8 py-4 text-sm tracking-widest",
};

const baseStyles =
  "inline-flex items-center justify-center font-poppins font-medium uppercase transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wbk-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  as,
  href,
  target,
  rel,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  type = "button",
  disabled,
}) {
  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (as === "link") {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
