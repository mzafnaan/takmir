"use client";

import React from "react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
  href?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "text-primary",
  trend,
  href,
}: StatCardProps) {
  const content = (
    <div className={`bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow duration-200 h-full ${href ? "hover:border-primary/50 cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-secondary mb-1 truncate">
            {title}
          </p>
          <p className={`text-2xl font-bold truncate ${color}`}>{value}</p>
          {trend && (
            <p className="text-xs text-text-secondary mt-1 truncate">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gray-50/50 flex-shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full block-link">
        {content}
      </Link>
    );
  }

  return content;
}
