"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProfileAccount } from "./types/user-profile";

export type { ProfileAccount };

interface ProfileContextType {
  currentLanguage: string;
  selectedAccount: ProfileAccount | null;
  setCurrentLanguage: (language: string) => void;
  setSelectedAccount: (account: ProfileAccount | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileContextProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>("");
  const [selectedAccount, setSelectedAccountState] = useState<ProfileAccount | null>(null);


  const setCurrentLanguage = useCallback((language: string) => {
    setCurrentLanguageState(language);
  }, []);

  const setSelectedAccount = useCallback((account: ProfileAccount | null) => {
    setSelectedAccountState(account);
  }, []);

  const value = useMemo<ProfileContextType>(
    () => ({
      currentLanguage,
      selectedAccount,
      setCurrentLanguage,
      setSelectedAccount,
    }),
    [currentLanguage, selectedAccount, setCurrentLanguage, setSelectedAccount]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileContextProvider");
  }
  return context;
}

/** Same context as {@link useProfileContext} when inside the provider; `undefined` otherwise (e.g. isolated tests). */
export function useProfileContextOptional(): ProfileContextType | undefined {
  return useContext(ProfileContext);
}
