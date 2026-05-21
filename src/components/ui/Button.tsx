// Reusable Button primitive
import React from "react";
import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ className, ...props }) => (
  <button className={cn("btn", className)} {...props} />
);

export default Button;
