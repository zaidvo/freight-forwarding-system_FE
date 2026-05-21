// Reusable Input primitive
import React from "react";
import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input className={cn("input", className)} {...props} />
);

export default Input;
