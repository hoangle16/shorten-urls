import { X } from "lucide-react";
import { useState } from "react";

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "md",
  className = "",
  closeOnClickOutside = true,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (closeOnClickOutside) {
      onClose();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  const shakeAnimation = isShaking ? "animate-shake" : "";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} ${className} ${shakeAnimation} transition-all`}
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className=""
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer with actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
