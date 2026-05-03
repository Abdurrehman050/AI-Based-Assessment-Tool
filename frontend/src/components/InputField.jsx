import React from "react";

export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  ...rest   // <--- this collects name and any extra props
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}   // <--- THIS FIXES TYPING ISSUE
        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
