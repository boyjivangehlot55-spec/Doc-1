import React from 'react';
import { RiskLevel } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normalizedLevel = level === 'High' ? 'High' : level === 'Low' ? 'Low' : 'Medium';

  const config = {
    High: {
      bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/60',
      icon: AlertTriangle,
      label: 'High Risk',
      dot: 'bg-red-500',
    },
    Medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
      icon: AlertCircle,
      label: 'Medium Risk',
      dot: 'bg-amber-500',
    },
    Low: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60',
      icon: CheckCircle2,
      label: 'Low Risk',
      dot: 'bg-emerald-500',
    },
  }[normalizedLevel];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide shadow-xs',
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <Icon
          className={
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          }
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
