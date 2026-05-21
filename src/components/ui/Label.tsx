// Reusable Label primitive
import React from "react";
import { cn } from "../../lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label: React.FC<LabelProps> = ({ className, ...props }) => (
  <label className={cn("label", className)} {...props} />
);

export default Label;
