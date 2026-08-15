"use client";

import { LabeledInputProps } from "@/types/global";
import React from "react";
import { useTranslation } from "react-i18next";


const LabeledInput: React.FC<LabeledInputProps> = ({
  label = "",
  name,
  value,
  onChange,
  isError = false,
  bgColor = "",
  isDisabled = false,
  className = "",
  isPrice = false,
  secondValue,
  type = "text",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        <input
          type={type}
          autoComplete="off"
          disabled={isDisabled}
          readOnly={isDisabled}
          name={name}
          value={value}
          onChange={onChange}
          className={`peer bg-transparent text-light-on-surface text-body-large focus:outline-0 dark:text-dark-on-surface h-[56px] px-4 rounded w-full 
  ${
    isDisabled
      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-20"
      : "bg-transparent"
  } ${
    isError
      ? "border-2 border-light-error dark:border-dark-error"
      : "border border-light-outline dark:border-dark-outline"
  }`}
        />

        {isPrice && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-on-surface-variant dark:text-dark-on-surface-variant pointer-events-none">
            {secondValue}
          </span>
        )}

        <label
          htmlFor={name}
          className={`absolute left-4 transition-all duration-200 transform
            ${
              value || value === 0
                ? "text-xs -top-2 px-1"
                : "top-[16px] text-body-large peer-focus:text-xs peer-focus:-top-2 px-1"
            }
            ${bgColor} pointer-events-none text-light-on-surface dark:text-dark-on-surface
             ${
               isDisabled
                 ? "text-light-on-surface-variant/40 dark:bg-dark-on-surface-variant/40"
                 : ""
             }`}
        >
          {t(label)}
        </label>
      </div>
    </div>
  );
};

export default LabeledInput;
