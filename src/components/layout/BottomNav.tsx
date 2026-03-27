"use client";

import { BOTTOM_NAV_ITEMS } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px]
                transition-all duration-200
                ${isActive ? "text-primary" : "text-text-secondary"}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-primary" : ""}`} />
              <span
                className={`text-xs font-medium ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
