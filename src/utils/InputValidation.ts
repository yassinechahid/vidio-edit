import { useTranslation } from "react-i18next";

export const useValidationMessages = () => {
  const { t } = useTranslation();

  const getPatternMessage = (type: string): string => {
    switch (type) {
      case "email":
        return t("validation.messages.email");
      case "phone":
        return t("validation.messages.phone");
      default:
        return t("validation.messages.default");
    }
  };

  const getRequiredMessageKey = (fieldName: string) => {
    const lower = fieldName.toLowerCase();

    if (
      lower.includes("fullName") ||
      lower.includes("fullname") ||
      lower.includes("nom complet")
    )
      return t("validation.required.fullName");
    if (lower.includes("email") || lower.includes("courriel"))
      return t("validation.required.email");

    if (
      lower.includes("phone") ||
      lower.includes("téléphone") ||
      lower.includes("telephone")
    )
      return t("validation.required.phone");

    if (lower.includes("subject") || lower.includes("sujet"))
      return t("validation.required.subject");

    if (lower.includes("message")) return t("validation.required.message");

    if (
      lower.includes("fonction") ||
      lower.includes("role") ||
      lower.includes("profession")
    )
      return t("validation.required.function");

    if (
      lower.includes("specialty") ||
      lower.includes("spécialité") ||
      lower.includes("specialite")
    )
      return t("validation.required.specialty");

    return t("validation.required.default");
  };

  return { getPatternMessage, getRequiredMessageKey };
};

export const firstNamePattern = /^[a-zA-Z\s]{4,}$/;
export const lastNamePattern = /^[a-zA-Z\s]{4,}$/;
export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phonePattern =
  /^(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/;
