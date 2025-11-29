import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  label: string;
}

const RetroButton: React.FC<RetroButtonProps> = ({ variant = 'primary', label, className = '', ...props }) => {
  const baseClasses = "font-['Press_Start_2P'] uppercase text-xs px-4 py-2 transition-transform active:translate-y-0.5 relative border-2 border-transparent";
  
  let colorClass = '';
  switch(variant) {
    case 'secondary':
      colorClass = 'bg-gray-700 text-white hover:bg-gray-600 shadow-[2px_2px_0_#000]';
      break;
    case 'danger':
      colorClass = 'bg-red-600 text-white hover:bg-red-500 shadow-[2px_2px_0_#400]';
      break;
    case 'primary':
    default:
      colorClass = 'bg-blue-600 text-white hover:bg-blue-500 shadow-[2px_2px_0_#000]';
      break;
  }

  return (
    <button 
      className={`${baseClasses} ${colorClass} ${className}`}
      {...props}
    >
      {label}
    </button>
  );
};

export default RetroButton;