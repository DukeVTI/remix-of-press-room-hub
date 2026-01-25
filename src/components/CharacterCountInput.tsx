import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CharacterCountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength: number;
  label?: string;
  type?: "text" | "email" | "password" | "textarea";
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function CharacterCountInput({
  value,
  onChange,
  maxLength,
  label,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
  className = "",
  ariaLabel,
}: CharacterCountInputProps) {
  const countColor = value.length > maxLength ? "text-red-600" : value.length > maxLength * 0.8 ? "text-yellow-600" : "text-muted-foreground";
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="font-medium mb-1" htmlFor={ariaLabel || label}>{label}</label>
      )}
      {type === "textarea" ? (
        <Textarea
          id={ariaLabel || label}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          disabled={disabled}
        />
      ) : (
        <Input
          id={ariaLabel || label}
          type={type}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          disabled={disabled}
        />
      )}
      <div className={`text-xs text-right ${countColor}`}>{value.length}/{maxLength}</div>
    </div>
  );
}
