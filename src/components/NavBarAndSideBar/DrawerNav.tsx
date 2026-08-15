"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { User, Mail } from "lucide-react";
import Image from "next/image";

interface DrawerNavProps {
  open: boolean;
  closeDrawerAction: () => void;
}

export const DrawerNav: React.FC<DrawerNavProps> = ({
  open,
  closeDrawerAction,
}) => {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        closeDrawerAction();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeDrawerAction]);

  const NavLinks = [
    {
      title: t("drawerNav.home"),
      icon: (
        <Image
          src="/assets/home.svg"
          alt="Home"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      ),
      onIcon: (
        <Image
          src="/assets/home.svg"
          alt="Home"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      ),
      path: "/",
    },
    {
      title: t("drawerNav.about"),
      icon: <User className="w-5 h-5" />,
      onIcon: <User className="w-5 h-5" />,
      path: "/about",
    },
    {
      title: t("drawerNav.contact"),
      icon: <Mail className="w-5 h-5" />,
      onIcon: <Mail className="w-5 h-5" />,
      path: "/contact",
    },
  ];

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeDrawerAction}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 h-screen w-[290px] bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow z-50 shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out rounded-r-[12px]"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center justify-between h-[40px]">
            <button
              onClick={closeDrawerAction}
              className="p-2.5 rounded-xl hover:bg-light-primaryContainer/40 dark:hover:bg-dark-primaryContainer/40 transition-colors duration-200 flex items-center justify-center"
              aria-label="Close menu">
              <Image
                src="/assets/menuClose.svg"
                alt="Close"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>

        {/* Navigation Links - Scrollable area */}
        <div className="flex-1 overflow-y-auto mx-1 px-4 py-6">
          <ul className="space-y-2">
            {NavLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  className={`h-[56px] w-full rounded-full flex items-center gap-3 text-label-large font-roboto font-medium transition-all duration-200 ${
                    isRTL ? "pr-[16px]" : "pl-[16px]"
                  } ${
                    pathname === item.path
                      ? "bg-light-primaryContainer dark:bg-dark-primaryContainer text-light-onPrimaryContainer dark:text-dark-onPrimaryContainer shadow-sm"
                      : "text-light-onSurface dark:text-dark-onSurface hover:bg-light-primaryContainer/50 dark:hover:bg-dark-primaryContainer/50 hover:text-light-primary dark:hover:text-dark-primary"
                  }`}
                  onClick={closeDrawerAction}>
                  <div className="flex-shrink-0">
                    {pathname === item.path ? item.onIcon : item.icon}
                  </div>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer - Copyright */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 text-center border-t border-light-outline/10 dark:border-dark-outline/10">
          <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            &copy; {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>
      </div>
    </>
  );
};
