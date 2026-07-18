import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AnalyticsPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[8px] border border-[#dfe3e6] bg-white ${className}`}
    >
      <header className="flex min-h-16 items-start justify-between gap-4 border-b border-[#edf0f2] px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] bg-[#e6f3f1] text-[#0f766e]">
              <Icon size={17} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#172126]">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-[#69767d]">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
