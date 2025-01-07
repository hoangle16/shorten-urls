import { forwardRef } from "react";

export const RadioButtonGroup = forwardRef(
  (
    {
      options,
      value,
      onChange,
      error,
      label,
      required = false,
      className = "",
      disabled = false,
      name,
      ...props
    },
    ref
  ) => {
    const handleChange = (optionValue) => {
      if (disabled) return;
      onChange?.({ target: { value: optionValue } });
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                disabled={disabled}
                className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors 
              ${
                isSelected
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${error ? "border-2 border-red-500" : ""}
              ${className}
              `}
                aria-pressed={isSelected}
                role="radio"
                aria-checked={isSelected}
                {...props}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

RadioButtonGroup.name = "RadioButtonGroup";
