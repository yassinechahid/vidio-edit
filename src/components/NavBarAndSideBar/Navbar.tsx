"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import LanguageMenu from "./LanguageMenu";
import { DrawerNav } from "./DrawerNav";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const changeLanguage = (lang: string) => i18n.changeLanguage(lang);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-xl bg-light-surface/90 dark:bg-dark-surface/90 shadow-lg border-b border-light-outline/10 dark:border-dark-outline/10"
          : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Home">
            <div className="relative">
              {/* Add your logo here */}
              <div className="w-12 h-12 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-white font-bold">
                L
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-light-onSurface dark:text-dark-onSurface">
                {t("nav.name")}
              </div>
              <div className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                {t("nav.role")}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                isActive("/")
                  ? "text-light-primary dark:text-dark-primary bg-light-primaryContainer/50 dark:bg-dark-primaryContainer/50"
                  : "text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primaryContainer/30 dark:hover:bg-dark-primaryContainer/30"
              }`}>
              {t("nav.home")}
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                isActive("/about")
                  ? "text-light-primary dark:text-dark-primary bg-light-primaryContainer/50 dark:bg-dark-primaryContainer/50"
                  : "text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primaryContainer/30 dark:hover:bg-dark-primaryContainer/30"
              }`}>
              {t("nav.about")}
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                isActive("/contact")
                  ? "text-light-primary dark:text-dark-primary bg-light-primaryContainer/50 dark:bg-dark-primaryContainer/50"
                  : "text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primaryContainer/30 dark:hover:bg-dark-primaryContainer/30"
              }`}>
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Menu */}
            <LanguageMenu changeLanguage={changeLanguage} />

            {/* Mobile Menu Button */}
            <button
              onClick={openDrawer}
              className="lg:hidden p-2.5 rounded-xl text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceContainerLow dark:hover:bg-dark-surfaceContainerLow transition-colors"
              aria-label="Open menu"
              aria-expanded={drawerOpen}>
              <Image
                src={
                  drawerOpen
                    ? "/assets/menuClose.svg"
                    : "/assets/menuNormal.svg"
                }
                alt="Menu"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer component */}
      <DrawerNav open={drawerOpen} closeDrawerAction={closeDrawer} />
    </header>
  );
};

export default Navbar;
