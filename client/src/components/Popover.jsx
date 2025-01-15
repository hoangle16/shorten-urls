import { useState, useRef, useEffect } from "react";

const Popover = ({
  children,
  content,
  position = "bottom",
  align = "left",
  className = "",
  trigger = "click",
  offset = 8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getPositionStyles = () => {
    const positions = {
      top: {
        left: "bottom-full left-0",
        right: "bottom-full right-0",
      },
      bottom: {
        left: "top-full left-0",
        right: "top-full right-0",
      },
      left: {
        top: "right-full top-0",
        bottom: "right-full bottom-0",
      },
      right: {
        top: "left-full top-0",
        bottom: "left-full bottom-0",
      },
    };

    const margins = {
      top: `mb-${offset}`,
      bottom: `mt-${offset}`,
      left: `mr-${offset}`,
      right: `ml-${offset}`,
    };

    // Handle vertical positions (top/bottom)
    if (["top", "bottom"].includes(position)) {
      return `${positions[position][align]} ${margins[position]}`;
    }

    // Handle horizontal positions (left/right)
    // For left/right positions, 'align' determines if popover aligns with top or bottom
    return `${positions[position][align]} ${margins[position]}`;
  };

  const handleTrigger = () => {
    if (trigger === "click") {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={triggerRef}
        onClick={handleTrigger}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>

      <div
        ref={popoverRef}
        className={`
          absolute z-50 min-w-[200px] bg-white rounded-lg shadow-lg
          border border-gray-200
          animate-fade duration-200
          ${getPositionStyles()}
          ${className}
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      >
        {typeof content === "function"
          ? content({ onClose: () => setIsOpen(false) })
          : content}
      </div>
    </div>
  );
};

export default Popover;
