import { useState, useCallback } from "react";
import { type ExternalToast, toast } from "sonner";

export const DEFAULT_TOAST_OPTIONS: ExternalToast = {
  position: "top-right",
  duration: 4500,
  closeButton: true,
  className: "text-sm font-medium text-gray-800",
};

export type ToastType = "info" | "success" | "warning" | "error" | "default";

interface UseToast {
  showInfoToast: (message: string, options?: ExternalToast) => void;
  showSuccessToast: (message: string, options?: ExternalToast) => void;
  showWarningToast: (message: string, options?: ExternalToast) => void;
  showErrorToast: (message: string, options?: ExternalToast) => void;
  showDefaultToast: (message: string, options?: ExternalToast) => void;
  setToastOptions: (options: ExternalToast) => void;
}

export type UseToastProps = {
  options?: ExternalToast;
};

const useToast = ({ options }: UseToastProps = {}): UseToast => {
  const [toastOptions, setToastOptions] = useState<ExternalToast>({
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
  });

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ExternalToast) => {
      const mergedOptions = {
        ...toastOptions,
        ...options,
      };

      if (type === "default") {
        toast(message, mergedOptions);
        return;
      }

      toast[type](message, mergedOptions);
    },
    [toastOptions]
  );

  const showInfoToast = useCallback(
    (message: string, options?: ExternalToast) => showToast("info", message, options),
    [showToast]
  );

  const showSuccessToast = useCallback(
    (message: string, options?: ExternalToast) => showToast("success", message, options),
    [showToast]
  );

  const showWarningToast = useCallback(
    (message: string, options?: ExternalToast) => showToast("warning", message, options),
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string, options?: ExternalToast) => showToast("error", message, options),
    [showToast]
  );

  const showDefaultToast = useCallback(
    (message: string, options?: ExternalToast) => showToast("default", message, options),
    [showToast]
  );

  const setToastOptionsCallback = useCallback(
    (options: ExternalToast) => {
      setToastOptions({
        ...DEFAULT_TOAST_OPTIONS,
        ...options,
      });
    },
    [setToastOptions]
  );

  return {
    showInfoToast,
    showSuccessToast,
    showWarningToast,
    showErrorToast,
    showDefaultToast,
    setToastOptions: setToastOptionsCallback,
  };
};

export default useToast;
