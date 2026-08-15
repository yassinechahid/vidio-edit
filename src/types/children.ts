import { ReactNode } from "react";

export interface LocaleLayoutProps {
  children: ReactNode;
}

export interface ServiceCardProps {
  icon: string;
  alt: string;
  title: string;
  description: string;
}

export interface LabeledInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean | string;
  isDisabled?: boolean;
  readOnly?: boolean;
  className?: string;
}
export interface GoButtonProps {
  title: string;
  onClick: () => void;
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
}
