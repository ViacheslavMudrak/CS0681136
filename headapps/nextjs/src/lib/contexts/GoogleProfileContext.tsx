import React, { createContext, useContext } from 'react';
import type { GoogleProfileData } from 'ts/google';

const GoogleProfileContext = createContext<GoogleProfileData | null>(null);

export function useGoogleProfile(): GoogleProfileData | null {
  return useContext(GoogleProfileContext);
}

interface GoogleProfileProviderProps {
  children: React.ReactNode;
  profile: GoogleProfileData | null;
}

export function GoogleProfileProvider({
  children,
  profile,
}: GoogleProfileProviderProps): React.ReactElement {
  return <GoogleProfileContext.Provider value={profile}>{children}</GoogleProfileContext.Provider>;
}
