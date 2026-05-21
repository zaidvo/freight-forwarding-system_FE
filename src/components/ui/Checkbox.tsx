// Reusable Checkbox primitive
import React from "react";
import { cn } from "../../lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => (
  <input type="checkbox" className={cn("checkbox", className)} {...props} />
);

export default Checkbox;
