// hooks/useDirection.ts
import { useTranslation } from "react-i18next";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

export const useDirection = () => {
  const { i18n } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  
  return {
    dir: isRTL ? "rtl" : "ltr",
    isRTL,
    language: i18n.language
  };
};