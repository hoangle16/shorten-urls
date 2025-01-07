import { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      type = "text",
      placeholder,
      value,
      onChange,
      error,
      label,
      required = false,
      className = "",
      inputClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          ref={ref}
          className={`
          w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
          }
          ${inputClassName}
        `}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

// Add display name for React DevTools
Input.displayName = "Input";
