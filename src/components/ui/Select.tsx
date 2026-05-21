// Reusable Select primitive (placeholder)
import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select: React.FC<SelectProps> = ({ className, ...props }) => (
  <select className={className} {...props} />
);

export default Select;
