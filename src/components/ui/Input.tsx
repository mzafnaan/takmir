"use client";

import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  id,
  required,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  
  // determine active type
  const activeType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-text-secondary mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/60 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          type={activeType}
          className={`
            w-full h-[42px] ${icon ? "pl-10" : "px-3"} ${type === "password" ? "pr-10" : "pr-3"} text-sm rounded-lg
            border border-border bg-white text-text-primary
            placeholder-text-secondary/50
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-150
            hover:border-gray-300
            ${error ? "border-danger ring-1 ring-danger/20 focus:ring-danger/20 focus:border-danger" : ""}
            ${className}
          `}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text-primary transition-colors cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <HiOutlineEyeOff className="w-[18px] h-[18px]" />
            ) : (
              <HiOutlineEye className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
