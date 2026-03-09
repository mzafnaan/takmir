"use client";

import React from "react";
import { HiMenuAlt3, HiOutlineBell } from "react-icons/hi";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <HiMenuAlt3 className="w-6 h-6 text-text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative cursor-pointer">
          <HiOutlineBell className="w-6 h-6 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>
    </div>
  );
}
