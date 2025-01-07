import { Button } from "./Button";

const ToastAlert = ({
  message,
  variant = "info",
  index,
  total,
  position = "top-right",
  onClose,
}) => {
  const variants = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };

  const offset = index * 4;
  const translateY = `translateY(${offset * 1.2}rem)`;

  const opacity = Math.max(1 - index * 0.15, 0.5);
  const scale = Math.max(1 - index * 0.05, 0.95);

  return (
    <div
      className={`
        fixed z-50 transition-all duration-300 ease-in-out
        ${position.includes("right") ? "right-4" : "left-4"}
        ${position.includes("top") ? "top-4" : "bottom-4"}`}
      style={{
        transform: translateY,
        opacity,
        scale,
      }}
    >
      <div
        className={`
          ${variants[variant]}
          px-4 py-3 rounded-lg border shadow-lg
          min-w-[320px] max-w-[420px]
          transition-all duration-300
          animate-toast-slide-in`}
        role="alert"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-2">{message}</div>
          <Button
            onClick={onClose}
            variant="custom"
            size="sm"
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || "top-right";
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {});
  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div key={position} className="relative">
          {positionToasts.map((toast, index) => (
            <ToastAlert
              key={toast.id}
              {...toast}
              index={index}
              total={positionToasts.length}
              position={position}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default ToastContainer;
