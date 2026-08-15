import React, { useState } from 'react';

export interface EditableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function EditableSelect({ value, onChange, options, placeholder }: EditableSelectProps) {
  const [isOther, setIsOther] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const normalizedValue = value ?? '';
  const hasValue = !!normalizedValue;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Otro') {
      setIsOther(true);
      setOtherValue('');
    } else {
      setIsOther(false);
      onChange(val);
    }
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOtherValue(val);
    onChange(val);
  };

  const handleOtherBlur = () => {
    if (!otherValue) {
      setIsOther(false);
      onChange('');
    }
  };

  if (isOther) {
    return (
      <input
        type="text"
        value={otherValue}
        onChange={handleOtherChange}
        onBlur={handleOtherBlur}
        placeholder="Escribe tu opción..."
        className="w-full bg-transparent outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder"
        autoFocus
      />
    );
  }

  return (
    <select
      value={normalizedValue}
      onChange={handleSelectChange}
      className={`w-full bg-[var(--color-bg-elevated)] outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder cursor-pointer ${!hasValue ? 'opacity-30' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      <option value="Otro">Otro</option>
    </select>
  );
}
