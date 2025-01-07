import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ToastContainer from "../components/ToastContainer";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toastIdCounter = useRef(0);

  const addToast = useCallback((message, options = {}) => {
    const defaultOptions = {
      variant: "info",
      duration: 5000,
      position: "top-right",
    };

    toastIdCounter.current += 1;
    const uniqueId = `${Date.now()}-${toastIdCounter.current}`;

    const newToast = {
      id: uniqueId,
      message,
      ...defaultOptions,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
