export interface LabeledInputProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
  bgColor?: string;
  isDisabled?: boolean;
  readOnly?: boolean;
  className?: string;
  isPrice?: boolean;
  secondValue?: string;
  isPassword?: boolean;
  type?: string;
}