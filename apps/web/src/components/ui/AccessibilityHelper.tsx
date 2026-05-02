import { ReactNode } from "react";

interface AccessibilityHelperProps {
  children: ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
}

export function AccessibilityHelper({ 
  children,
  role,
  ariaLabel,
  ariaDescribedBy,
  tabIndex = 0
}: AccessibilityHelperProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}
