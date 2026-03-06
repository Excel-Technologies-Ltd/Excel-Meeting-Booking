import React from "react";
import { cn } from "../../utilities/cn";

type Tag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div";

type Size = "sm" | "md" | "lg" | "xl" | "2xl";

type Color = "default" | "white" | "black" | "primary" | "secondary";

type Bg = "none" | "dark" | "light" | "primary";

type Weight = "normal" | "medium" | "semibold" | "bold";

type Style = "normal" | "italic";

interface TitleProps {
  children: React.ReactNode;
  tag?: Tag;
  size?: Size;
  color?: Color;
  bg?: Bg;
  weight?: Weight;
  style?: Style;
  className?: string;
}

const sizeVariants: Record<Size, string> = {
  sm: "text-sm md:text-base",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
  "2xl": "text-2xl md:text-3xl",
};

const colorVariants: Record<Color, string> = {
  default: "text-gray-800",
  white: "text-white",
  black: "text-black",
  primary: "text-blue-600",
  secondary: "text-gray-500",
};

const bgVariants: Record<Bg, string> = {
  none: "",
  dark: "bg-gray-900",
  light: "bg-gray-100",
  primary: "bg-blue-600",
};

const weightVariants: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const styleVariants: Record<Style, string> = {
  normal: "not-italic",
  italic: "italic",
};

export default function Title({
  children,
  tag = "h1",
  size = "xl",
  color = "white",
  bg = "none",
  weight = "semibold",
  style = "normal",
  className = "",
}: TitleProps) {
  const Component = tag;

  return (
    <Component
      className={cn(
       sizeVariants[size],
       colorVariants[color],
       bgVariants[bg],
       weightVariants[weight],
       styleVariants[style],
       className,
      )
      }
    >
      {children}
    </Component>
  );
}