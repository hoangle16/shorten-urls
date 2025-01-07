import { forwardRef, useState, useEffect, useRef } from "react";

export const SearchableSelect = forwardRef(
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
      name,
      onBlur
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value) || null;

    useEffect(() => {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }, [searchTerm, options]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    const handleOptionClick = (option) => {
      // Handle both direct onChange and React Hook Form onChange
      if (onChange) {
        // For React Hook Form compatibility
        onChange({
          target: {
            name,
            value: option.value,
            type: "select",
          },
        });

        // Trigger blur event for form validation
        if (onBlur) {
          onBlur({
            target: {
              name,
              value: option.value,
            },
          });
        }
      }
      setIsOpen(false);
      setSearchTerm("");
    };

    return (
      <div className="w-full" ref={dropdownRef}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full px-4 py-2 cursor-pointer ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </div>
          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                      option.value === value ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;
