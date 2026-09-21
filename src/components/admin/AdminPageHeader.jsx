"use client";

import React from "react";

/**
 * Standardized, dynamic Page Header component for all Admin Dashboard pages.
 * Styled after the Product Management header for visual consistency across the entire console.
 *
 * @param {string} [badge] - Eyebrow category tag (e.g. "Catalog & Inventory")
 * @param {string} title - Page headline (e.g. "Product Management")
 * @param {string|number} [count] - Optional counter badge (e.g. 234 or "12 Total")
 * @param {string|React.ReactNode} [description] - Subtitle explaining the page purpose
 * @param {React.ReactNode} [actions] - Action buttons rendered on the right (e.g. Refresh, Add, Save)
 * @param {React.ReactNode} [children] - Optional secondary content row (search bar, filter tabs)
 * @param {string} [className] - Additional wrapper styling
 */
export function AdminPageHeader({
  badge,
  title,
  count,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-4 pb-6 border-b border-wbk-lightgrey/60 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wbk-gold block mb-1">
              {badge}
            </span>
          )}
          <div className="flex items-center gap-3">
            <h1 className="font-new-york text-2xl sm:text-3xl font-medium text-wbk-black tracking-tight">
              {title}
            </h1>
            {count !== undefined && count !== null && (
              <span className="px-2.5 py-0.5 rounded-full bg-wbk-black text-white text-[10px] font-semibold tracking-wider">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-wbk-brown mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
