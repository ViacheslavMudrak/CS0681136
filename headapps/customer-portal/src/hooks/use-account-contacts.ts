"use client";

import { useMemo } from "react";

import type { ContactSupportServiceSelectionItem } from "@/components/core/ContactSupport/ContactSupport.type";
import type { AccountContactDisplay } from "@/lib/contact-support-utils";
import { buildAccountContactsFromSelection } from "@/lib/contact-support-utils";
import { useProfileContext } from "@/lib/profile-context";
import { useUserProfile } from "@/lib/user-profile-context";

export function useAccountContacts(
  servicesSelection?: ContactSupportServiceSelectionItem[]
): AccountContactDisplay[] {
  const { profile } = useUserProfile();
  const { selectedAccount } = useProfileContext();

  return useMemo(() => {
    if (!profile?.parentContact?.length || !selectedAccount?.id || !servicesSelection?.length) {
      return [];
    }

    for (const parent of profile.parentContact) {
      const childContacts = parent.childContacts ?? [];
      for (const child of childContacts) {
        if (child.account?.id === selectedAccount.id && child.account) {
          return buildAccountContactsFromSelection(child.account, servicesSelection);
        }
      }
    }

    return [];
  }, [profile, selectedAccount?.id, servicesSelection]);
}
