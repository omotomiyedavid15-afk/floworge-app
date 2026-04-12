"use client";

import React from "react";

type ButtonVariant = "black-pill" | "white-pill" | "glass-dark" | "glass-light" | "brand-green";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary — light pill on dark canvas
  "black-pill":
    "bg-[#ededed] text-[#0d0d0d] hover:opacity-90 active:opacity-80 shadow-[rgba(0,0,0,0.3)_0px_1px_2px]",
  // Secondary — subtle surface
  "white-pill":
    "bg-[rgba(255,255,255,0.08)] text-[#ededed] hover:bg-[rgba(255,255,255,0.13)] active:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)]",
  // Ghost/glass for dark backgrounds
  "glass-dark":
    "bg-[rgba(255,255,255,0.06)] text-[#ededed] hover:bg-[rgba(255,255,255,0.10)] active:bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.08)]",
  // Glass for dark overlay sections
  "glass-light":
    "bg-[rgba(255,255,255,0.14)] text-[#ededed] hover:bg-[rgba(255,255,255,0.20)] active:bg-[rgba(255,255,255,0.24)]",
  // Brand green CTA
  "brand-green":
    "bg-[#18e299] text-[#0d0d0d] hover:opacity-90 active:opacity-80 shadow-[rgba(0,0,0,0.3)_0px_1px_2px]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-[4.5px] text-[15px] rounded-full",
  md: "px-6 py-2 text-[15px] rounded-full",
  lg: "px-8 py-3 text-[15px] rounded-full",
  icon: "w-10 h-10 rounded-full flex items-center justify-center p-0",
};

export default function Button({
  variant = "black-pill",
  size = "md",
  children,
  className = "",
  href,
  ...props
}: ButtonProps) {
  const classes = `
    inline-flex items-center justify-center gap-2
    font-[500] tracking-normal
    transition-all duration-200 ease-out
    cursor-pointer select-none
    focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
