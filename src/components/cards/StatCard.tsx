"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "text-primary",
  trend,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && <p className="text-xs text-text-secondary mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-blue-50 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
