'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { LocaleProvider } from './LocaleProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider basePath="/king2/api/auth">
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </SessionProvider>
  );
}
