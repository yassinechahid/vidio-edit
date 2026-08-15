"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import Image from "next/image";

interface LanguageMenuProps {
  changeLanguage: (lang: string) => void;
}

const UKFlag = () => (
  <Image src="/assets/english.svg" alt="UK" width={24} height={24} />
);

const FranceFlag = () => (
  <Image src="/assets/franceFlag.svg" alt="France" width={24} height={24} />
);

const SaudiFlag = () => (
  <Image src="/assets/morocco.svg" alt="Saudi Arabia" width={24} height={24} />
);

const LanguageMenu: React.FC<LanguageMenuProps> = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem("language") || "en";
    i18n.changeLanguage(storedLang);
    setCurrentLang(storedLang);
  }, [i18n]);

  const handleLanguageChange = (lang: string) => {
    if (i18n.language === lang) return;

    changeLanguage(lang);
    setIsOpen(false);
    localStorage.setItem("language", lang);
    setCurrentLang(lang);

    setTimeout(() => {
      window.location.reload();
    }, 10);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="text-light-onSurface dark:text-dark-onSurface flex items-center hover:bg-light-primaryContainer/40 dark:hover:bg-dark-primaryContainer/40 gap-2 p-2.5 rounded-xl cursor-pointer transition duration-200">
        <Globe className="w-5 h-5" />
        <span className="text-sm uppercase">{currentLang}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 bg-light-background dark:bg-dark-background z-[9999] shadow-lg rounded-md w-48 text-light-primary dark:text-dark-primary text-body-large ${
            i18n.language === "ar" ? "left-0" : "right-0"
          }`}>
          <div
            onClick={() => handleLanguageChange("ar")}
            className="flex items-center gap-2 p-2 hover:bg-light-primaryContainer/60 dark:hover:bg-dark-primaryContainer/60 cursor-pointer rounded-md transition duration-200">
            <SaudiFlag />
            <span>{t("languages.ar")}</span>
          </div>
          <div
            onClick={() => handleLanguageChange("en")}
            className="flex items-center gap-2 p-2 hover:bg-light-primaryContainer/60 dark:hover:bg-dark-primaryContainer/60 cursor-pointer rounded-md transition duration-200">
            <UKFlag />
            <span>{t("languages.en")}</span>
          </div>

          <div
            onClick={() => handleLanguageChange("fr")}
            className="flex items-center gap-2 p-2 hover:bg-light-primaryContainer/60 dark:hover:bg-dark-primaryContainer/60 cursor-pointer rounded-md transition duration-200">
            <FranceFlag />
            <span>{t("languages.fr")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageMenu;
