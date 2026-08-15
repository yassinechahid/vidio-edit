"use client";
import React from "react";
import {
  defaultCountries,
  parseCountry,
  PhoneInput,
} from "react-international-phone";

interface PhoneNumberInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export default function PhoneNumberInputField({
  value,
  onChange,
  error,
}: PhoneNumberInputFieldProps) {

  const allowed = defaultCountries.filter((c) => {
    const { iso2 } = parseCountry(c);
    return iso2 !== "il";
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className={`flex h-14 rounded-xl bg-light-surface dark:bg-dark-surface border overflow-visible transition-all ${
          error
            ? "border-light-error border-2 dark:border-dark-error"
            : "border-light-outline dark:border-dark-outline hover:border-light-primary dark:hover:border-dark-primary"
        }`}>
        <PhoneInput
          countries={allowed}
          required={true}
          value={value}
          name="phone"
          onChange={onChange}
          // hideCountryCode={false}
          defaultCountry="ma"
          // disableCountryCode={true}
          inputStyle={{
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            padding: "0 16px",
            color: "inherit",
            fontSize: "16px",
          }}
          countrySelectorStyleProps={{
            buttonStyle: {
              height: "100%",
              padding: "0 12px",
              background: "transparent",
              border: "none",
            },
            flagStyle: {
              width: "24px",
              height: "18px",
            },
            dropdownStyleProps: {
              style: {
                position: "absolute",
                zIndex: 1000,
                marginTop: "4px",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              },
              className: "phone-dropdown-professional",
            },
          }}
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
          className="phone-input-custom-dropdown"
        />
      </div>
      {error && (
        <span className="text-xs text-light-error dark:text-dark-error">
          {error}
        </span>
      )}
      <style jsx global>{`
        .phone-dropdown-professional,
        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown {
          background-color: #ffffff !important;
          border: 1px solid #e0e0e0 !important;
          color: #1d1b20 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          width: auto !important;
          min-width: 280px !important;
          max-width: min(320px, 90vw) !important;
          max-height: min(340px, 60vh) !important;
        }

        @media (max-width: 640px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            min-width: 260px !important;
            max-width: 85vw !important;
          }
        }

        @media (max-width: 480px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            min-width: 240px !important;
            max-width: 80vw !important;
          }
        }

        @media (max-width: 360px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            min-width: 220px !important;
            max-width: 75vw !important;
          }
        }

        @media (max-height: 800px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            max-height: 55vh !important;
          }
        }

        @media (max-height: 600px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            max-height: 50vh !important;
          }
        }

        @media (max-height: 500px) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            max-height: 45vh !important;
          }
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-button {
          border-right: 1px solid #e0e0e0 !important;
          transition: background-color 0.2s ease !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-button:hover {
          background-color: rgba(103, 80, 164, 0.08) !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list {
          max-height: min(280px, 55vh) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 6px !important;
        }

        @media (max-height: 600px) {
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list {
            max-height: 45vh !important;
          }
        }

        @media (max-height: 500px) {
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list {
            max-height: 40vh !important;
          }
        }
        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar {
          width: 10px;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar-track {
          background: transparent;
          margin: 6px;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item {
          padding: 10px 12px !important;
          min-height: 44px !important;
          border-radius: 8px !important;
          margin-bottom: 2px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          color: #1d1b20 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          border: none !important;
          background-color: transparent !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item:hover {
          background-color: #f5f5f5 !important;
          transform: translateX(2px);
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item--selected {
          background-color: #e8def8 !important;
          font-weight: 600 !important;
          color: #21005d !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item--selected:hover {
          background-color: #d8cee8 !important;
        }

        @media (max-width: 480px) {
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item {
            padding: 8px 10px !important;
            min-height: 40px !important;
            gap: 6px !important;
            font-size: 13px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-flag-emoji,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-button__flag-emoji {
            font-size: 18px !important;
            width: 20px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-country-name {
            font-size: 13px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-dial-code {
            font-size: 12px !important;
          }
        }

        @media (max-width: 360px) {
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item {
            padding: 7px 8px !important;
            min-height: 38px !important;
            gap: 5px !important;
            font-size: 12px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-flag-emoji,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-button__flag-emoji {
            font-size: 16px !important;
            width: 18px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-country-name {
            font-size: 12px !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-dial-code {
            font-size: 11px !important;
          }
        }
        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item-flag-emoji,
        .phone-input-custom-dropdown
          .react-international-phone-country-selector-button__flag-emoji {
          font-size: 20px !important;
          line-height: 1 !important;
          width: 24px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item-country-name {
          flex: 1 !important;
          font-size: 14px !important;
          text-align: left !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-country-selector-dropdown__list-item-dial-code {
          color: #666666 !important;
          font-weight: 500 !important;
          font-size: 13px !important;
          margin-left: auto !important;
          flex-shrink: 0 !important;
        }

        .phone-input-custom-dropdown .react-international-phone-input {
          color: inherit !important;
          font-size: 16px !important;
        }

        .phone-input-custom-dropdown
          .react-international-phone-input::placeholder {
          color: #999999 !important;
        }
        @media (prefers-color-scheme: dark) {
          .phone-dropdown-professional,
          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown {
            background-color: #1e1b1f !important;
            border-color: #48464c !important;
            color: #e6e1e5 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-button {
            border-right-color: #48464c !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-button:hover {
            background-color: rgba(208, 188, 255, 0.08) !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item {
            color: #e6e1e5 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item:hover {
            background-color: #2b2930 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item--selected {
            background-color: #4a4458 !important;
            color: #d0bcff !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item--selected:hover {
            background-color: #544862 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list-item-dial-code {
            color: #938f99 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-input::placeholder {
            color: #666666 !important;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar-thumb {
            background: #48464c;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .phone-input-custom-dropdown
            .react-international-phone-country-selector-dropdown__list::-webkit-scrollbar-thumb:hover {
            background: #5a5860;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
        }
      `}</style>
    </div>
  );
}
