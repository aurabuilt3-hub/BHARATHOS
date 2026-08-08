'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';


export default function ThemeProviderWrapper({ children, ...props }: any) {
  return (
    <ThemeProvider {...props}>
      {children}
    </ThemeProvider>
  );
}
