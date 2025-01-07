import { forwardRef } from "react";

export const Select = forwardRef(
  (
    {
      options,
      value,
      onChange,
      error,
      label,
      required = false,
      className = "",
      placeholder,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-4 py-2 
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            ${className}`}
          style={{
            appearance: "none",
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="%23333333" width="20" height="20"><path d="M4 6l4 4 4-4H4z"/></svg>')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            paddingRight: "2rem",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
