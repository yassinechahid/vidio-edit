import React, { useEffect } from "react";
import { MdCheckCircle, MdError, MdClose } from "react-icons/md";

interface AlertProps {
  type: "success" | "error";
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 rounded-lg shadow-md flex items-center justify-between p-4 ${
        type === "success"
          ? "bg-green-100 border-l-4 border-green-500"
          : "bg-red-100 border-l-4 border-red-500"
      }`}
      role="alert"
    >
      <div className="flex items-center">
        {type === "success" ? (
          <MdCheckCircle className="w-6 h-6 mr-2 text-green-500" />
        ) : (
          <MdError className="w-6 h-6 mr-2 text-red-500" />
        )}
        <span
          className={`text-sm font-medium ${
            type === "success" ? "text-green-800" : "text-red-800"
          }`}
        >
          {message}
        </span>
      </div>
      <button
        onClick={onClose}
        className={`p-1 rounded-full ${
          type === "success" ? "hover:bg-green-200" : "hover:bg-red-200"
        }`}
        aria-label="Close"
      >
        <MdClose
          className={`w-4 h-4 ${
            type === "success" ? "text-green-600" : "text-red-600"
          }`}
        />
      </button>
    </div>
  );
};

export default Alert;
