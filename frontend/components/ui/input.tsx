import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional ref is forwarded */
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const baseClasses =
      'relative block w-full rounded-lg border border-slate-800 bg-[#050816] px-3 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm';
    return (
      <input ref={ref} className={`${baseClasses} ${className}`} {...props} />
    );
  }
);

Input.displayName = 'Input';
