import React from "react";

const RenderValue = ({ type = "text", value }) => {
  switch (type) {
    case "textarea":
      return (
        <div className="text-gray-600 border-b pb-2 min-w-0 whitespace-pre-wrap break-words">
          {value}
        </div>
      );
    case "code":
      return (
        <pre className="text-gray-600 border-b pb-2 min-w-0 overflow-x-auto font-mono bg-gray-50 p-2 rounded">
          {value}
        </pre>
      );
    case "url":
      return (
        <div className="text-gray-600 border-b pb-2 min-w-0 break-all">
          <a href={value} target="_blank" className="a-link-default">
            {value}
          </a>
        </div>
      );
    default:
      return (
        <div className="text-gray-600 border-b pb-2 min-w-0 truncate">
          {value}
        </div>
      );
  }
};

export const InfoGrid = ({ fields, className = "" }) => (
  <div className={`bg-white px-6 py-4 rounded-xl shadow-lg ${className}`}>
    <div className="grid grid-cols-[auto,1fr] gap-y-4">
      {fields.map(({ label, value, type }) => (
        <React.Fragment key={label}>
          <p className="font-medium text-gray-800 border-b pb-2 pr-4">
            {label}
          </p>
          <RenderValue type={type} value={value} />
        </React.Fragment>
      ))}
    </div>
  </div>
);
