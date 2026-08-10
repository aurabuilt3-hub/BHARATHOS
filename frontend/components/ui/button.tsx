import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses =
      'group relative flex w-full justify-center rounded-lg bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#050816] disabled:opacity-50 transition-colors';
    return (
      <button ref={ref} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
