export const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) => {
  const baseStyles =
    "font-medium rounded-lg focus:outline-none transition-colors"; // focus:ring-4

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-300",
    info: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300",
    warning:
      "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-300",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-300",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-300",
    light: "bg-gray-200 hover:bg-gray-300 text-black focus:ring-gray-100",
    dark: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-1000",
    custom: "",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};
