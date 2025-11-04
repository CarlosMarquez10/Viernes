import React from 'react';

export default function LoadingSpinner({ size = 'small', text = 'Cargando...' }) {
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  const cls = sizes[size] || sizes.small;
  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <svg className={`${cls} animate-spin text-indigo-600`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}