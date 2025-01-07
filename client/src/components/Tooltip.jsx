import { useState } from "react";

const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 200,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const getPositionStyles = () => {
    const positions = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return positions[position] || positions.top;
  };

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <div
      className="relative block w-full"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          className={`
          absolute z-50
          px-2 py-1 
          text-sm text-white
          bg-gray-800 
          rounded-md
          whitespace-nowrap
          transform
          transition-opacity duration-200
          ${getPositionStyles()}
          ${className}
        `}
          role="tooltip"
        >
          {content}

          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 
              bg-gray-800 
              transform rotate-45
              ${
                position === "top"
                  ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                  : position === "bottom"
                  ? "top-[-4px] left-1/2 -translate-x-1/2"
                  : position === "left"
                  ? "right-[-4px] top-1/2 -translate-y-1/2"
                  : "left-[-4px] top-1/2 -translate-y-1/2"
              }
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
