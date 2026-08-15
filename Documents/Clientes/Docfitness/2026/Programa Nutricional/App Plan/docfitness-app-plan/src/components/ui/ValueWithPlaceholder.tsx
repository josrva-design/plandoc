import React from 'react';

export interface ValueWithPlaceholderProps {
  value?: string | number | null;
  placeholder: string;
  className?: string;
}

export default function ValueWithPlaceholder({ value, placeholder, className = '' }: ValueWithPlaceholderProps) {
  if (value) {
    return <span className={className}>{value}</span>;
  }
  return <span className={`opacity-20 ${className}`}>{placeholder}</span>;
}
