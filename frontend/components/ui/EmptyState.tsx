import { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-elevated border border-[var(--border-subtle)] flex items-center justify-center text-3xl">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="primary" size="sm">{action.label}</Button>
          </a>
        ) : (
          <Button variant="primary" size="sm" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
