"use client";

import { useEffect, useRef, useState } from "react";
import { HiCheck, HiSelector } from "react-icons/hi";

interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function Select({
  label,
  options,
  error,
  placeholder = "Pilih...",
  value,
  onChange,
  required,
  disabled,
  className = "",
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange?.({ target: { value: optValue } });
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[13px] font-medium text-text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden native select for form validation */}
      <select
        id={selectId}
        value={value}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-[42px] flex items-center justify-between px-3 text-sm rounded-lg
          border bg-white transition-all duration-150 cursor-pointer text-left
          ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-gray-300"}
          ${error ? "border-danger ring-1 ring-danger/20" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
        `}
      >
        <span
          className={
            selectedOption
              ? "text-text-primary truncate"
              : "text-text-secondary/50 truncate"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiSelector className="w-4 h-4 text-text-secondary/40 flex-shrink-0 ml-2" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-auto rounded-lg bg-white border border-border shadow-lg animate-dropdownOpen py-1">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-left text-sm
                  transition-colors duration-100 cursor-pointer
                  ${isSelected ? "bg-primary/5 text-primary font-medium" : "text-text-primary hover:bg-gray-50"}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <HiCheck className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
