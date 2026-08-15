import React from 'react';

export interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function Select({ value, onChange, options, placeholder }: SelectProps) {
  const hasValue = !!value;
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      className={`w-full bg-[var(--color-bg-elevated)] outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder cursor-pointer ${!hasValue ? 'opacity-30' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}
