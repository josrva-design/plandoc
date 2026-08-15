import React from 'react';

export default function IconX({ size = 9, color = 'white' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3L9 9M9 3L3 9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
