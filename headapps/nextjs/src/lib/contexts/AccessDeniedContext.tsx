'use client';

import React, { createContext, useContext } from 'react';

interface AccessDeniedContextValue {
  requestAccess: boolean;
  returnUrl: string;
  userEmail: string;
}

const AccessDeniedContext = createContext<AccessDeniedContextValue>({
  requestAccess: false,
  returnUrl: '',
  userEmail: '',
});

export function useAccessDenied(): AccessDeniedContextValue {
  return useContext(AccessDeniedContext);
}

interface AccessDeniedProviderProps {
  children: React.ReactNode;
  requestAccess: boolean;
  returnUrl: string;
  userEmail: string;
}

export function AccessDeniedProvider({
  children,
  requestAccess,
  returnUrl,
  userEmail,
}: AccessDeniedProviderProps): React.ReactElement {
  return (
    <AccessDeniedContext.Provider value={{ requestAccess, returnUrl, userEmail }}>
      {children}
    </AccessDeniedContext.Provider>
  );
}
