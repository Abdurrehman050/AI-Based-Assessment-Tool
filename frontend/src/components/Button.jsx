import React from "react";

export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-accent text-white font-medium hover:brightness-95 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
