import React from "react";

const Button = ({ children, ...props }) => (
  <button className="p-2 bg-blue-500 text-black rounded" {...props}>
    {children}
  </button>
);

export default Button;
