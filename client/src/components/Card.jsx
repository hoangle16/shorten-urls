export const Card = ({ children, title, subtitle, footer, className = "" }) => {
  return (
    <div
      className={`"bg-white rounded-xl shadow-md overflow-hidden" ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-300">
          {title && (
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
