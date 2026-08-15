"use client";

import React from "react";
import { useTranslation } from "react-i18next";

interface LabeledInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isError?: boolean;
  bgColor?: string;
  isDisabled?: boolean;
  className?: string;
}

const LabeledTextArea: React.FC<LabeledInputProps> = ({
  label,
  name,
  value,
  onChange,
  isError = false,
  bgColor = "",
  isDisabled = false,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        <textarea
          autoComplete="off"
          readOnly={isDisabled}
          name={name}
          value={value}
          onChange={onChange}
          rows={4}
          className={`bg-transparent text-light-on-surface text-body-large dark:text-dark-on-surface px-4 rounded w-full peer ${
            isError
              ? "border-2 border-light-error dark:border-dark-error"
              : "border border-light-outline dark:border-dark-outline"
          }
          ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}
          resize-y pt-4 pb-2`}
        />
        <label
          htmlFor={name}
          className={`absolute left-4 transition-all duration-200 transform
            ${
              value
                ? "text-xs -top-2 px-1"
                : "top-4 text-body-large peer-focus:text-xs peer-focus:-top-2 px-1"
            }
            ${bgColor} pointer-events-none text-light-on-surface dark:text-dark-on-surface
            ${isDisabled ? "opacity-30 " : ""}`}
        >
          {t(label)}
        </label>
      </div>
    </div>
  );
};

export default LabeledTextArea;
