"use client";

import React, { useEffect, useRef } from "react";
import { HiX } from "react-icons/hi";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<string, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[500px]",
  lg: "max-w-[600px]",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xl animate-fadeIn p-4 sm:p-0"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{ margin: 0, padding: 0 }}
    >
      <div
        className={`
          bg-white rounded-2xl w-[calc(100%-2rem)] sm:w-full ${sizeStyles[size]}
          max-h-[85vh] flex flex-col animate-slideUp
          shadow-2xl mx-auto
        `}
        style={{ margin: "auto" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              {subtitle && (
                <p className="text-sm text-text-secondary mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-text-secondary cursor-pointer shrink-0"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 h-px bg-border" />
        </div>

        {/* Body */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  // Render modal at the very top level using a Portal to escape any padding wrappers
  return createPortal(modalContent, document.body);
}
