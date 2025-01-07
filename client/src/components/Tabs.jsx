import { Loader2 } from "lucide-react";
import React, { createContext, useContext, useState } from "react";
import Loading from "./Loading";

const TabContext = createContext();

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  variant = "default",
  className = "",
  isLoading = false,
  lazyBehavior = "unmount", // 'unmount' | 'keepMounted
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const [mountedTabs, setMountedTabs] = useState(new Set([defaultValue]));

  const currentValue = value !== undefined ? value : activeTab;
  const onChange = (newValue) => {
    setMountedTabs((prev) => new Set([...prev, newValue]));

    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };

  return (
    <TabContext.Provider
      value={{
        value: currentValue,
        onChange,
        variant,
        isLoading,
        lazyBehavior,
        mountedTabs,
      }}
    >
      <div className={`${variant === "vertical" ? "flex" : ""} ${className}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

export const TabsList = ({ children, className = "" }) => {
  const { variant, isLoading } = useContext(TabContext);

  const variantStyles = {
    default: "flex",
    pills: "flex space-x-2",
    underline: "flex",
    boxed: "flex bg-white rounded-md p-1",
    vertical: "flex flex-col space-y-2",
    soft: "flex space-x-1",
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className} relative`}
      role="tablist"
    >
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  children,
  className = "",
  disabled = false,
}) => {
  const { value: activeValue, onChange, variant } = useContext(TabContext);
  const isActive = activeValue === value;

  const variantStyles = {
    default: `px-4 py-2 font-medium text-sm transition-all
      ${
        isActive
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-600 hover:text-gray-900"
      }`,
    pills: `px-4 py-2 rounded-full font-medium text-sm transition-all
      ${
        isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`,
    underline: `px-4 py-2 font-medium text-sm transition-all border-b-2
      ${
        isActive
          ? "text-blue-600 border-blue-600"
          : "border-transparent text-gray-600 hover:border-gray-200"
      }`,
    boxed: `px-4 py-2 font-medium text-sm transition-all rounded
      ${isActive ? "bg-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`,
    vertical: `px-4 py-2 font-medium text-sm transition-all rounded-lg text-left
      ${
        isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`,
    soft: `px-4 py-2 font-medium text-sm transition-all rounded-md
      ${
        isActive
          ? "bg-white shadow-sm text-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`,
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      onClick={() => !disabled && onChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  className = "",
  fallback = <Loading size="2rem" />,
}) => {
  const {
    value: activeValue,
    lazyBehavior,
    mountedTabs,
  } = useContext(TabContext);

  const isActive = activeValue === value;
  const hasBeenMounted = mountedTabs.has(value);

  if (lazyBehavior === "unmount" && !hasBeenMounted) {
    return null;
  }

  if (!isActive) {
    if (lazyBehavior === "keepMounted") {
      return <div style={{ display: "none" }}>{children}</div>;
    }

    return null;
  }

  if (isActive && !hasBeenMounted && fallback) {
    return (
      <div role="tabpanel" className={`mt-4 ${className}`}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      className={`mt-4 animate-fade duration-200  ${className}`}
    >
      {children}
    </div>
  );
};
