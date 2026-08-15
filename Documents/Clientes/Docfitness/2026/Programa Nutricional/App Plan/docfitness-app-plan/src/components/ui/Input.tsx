export interface InputProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

export default function Input({ value, onChange, placeholder, type = 'text' }: InputProps) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none typo-input border-b border-transparent focus:border-[var(--color-primary)] input-placeholder"
    />
  );
}
