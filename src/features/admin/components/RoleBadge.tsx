import React from 'react';
import { Role } from '../../../types';
import {
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Home,
  UtensilsCrossed,
  Calculator,
  ShieldCheck,
  Crown,
  Award,
} from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  admin: {
    label: 'Administrator',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    icon: Crown,
  },
  principal: {
    label: 'Principal',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: Award,
  },
  hod: {
    label: 'Head of Dept',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: Briefcase,
  },
  teacher: {
    label: 'Faculty Mentor',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    icon: Briefcase,
  },
  student: {
    label: 'Student Scholar',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    icon: GraduationCap,
  },
  warden: {
    label: 'Hostel Warden',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: Home,
  },
  security: {
    label: 'Campus Security',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    icon: ShieldCheck,
  },
  canteen: {
    label: 'Mess Supervisor',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    icon: UtensilsCrossed,
  },
  accounts: {
    label: 'Finance Officer',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
    icon: Calculator,
  },
};

export function RoleBadge({ role, className = '', size = 'md' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] || {
    label: role.toUpperCase(),
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/20',
    icon: ShieldAlert,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium font-mono rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon size={iconSizes} className="shrink-0 opacity-80" />
      <span>{config.label}</span>
    </span>
  );
}
