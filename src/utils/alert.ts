import { i18n } from "i18next";
import Swal from "sweetalert2";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  timer?: number;
}

let i18nInstance: i18n;

export const initializeAlerts = (i18nRef: i18n) => {
  i18nInstance = i18nRef;
};

const getDefaultTitle = (type: AlertType): string => {
  const titleKeys = {
    success: "alerts.success",
    error: "alerts.error",
    warning: "alerts.warning",
    info: "alerts.info",
  };

  return i18nInstance?.t(titleKeys[type]) || type.toUpperCase();
};

export const ShowAlert = (options: AlertOptions) => {
  const { title, message, type = "success", timer = 3000 } = options;

  const translatedMessage = i18nInstance?.t(message) || message;
  const translatedTitle = title
    ? i18nInstance?.t(title) || title
    : getDefaultTitle(type);

  return Swal.fire({
    title: translatedTitle,
    text: translatedMessage,
    icon: type,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    customClass: {
      popup: "small-toast",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

export const successAlert = (message: string) =>
  ShowAlert({ message, type: "success" });

export const errorAlert = (message: string) =>
  ShowAlert({ message, type: "error" });

export const warningAlert = (message: string) =>
  ShowAlert({ message, type: "warning" });

export const infoAlert = (message: string) =>
  ShowAlert({ message, type: "info" });
