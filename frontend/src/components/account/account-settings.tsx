"use client";

import {
  DatabaseIcon,
  LockIcon,
  UserRoundIcon,
} from "lucide-react";

import { AccountDataSection } from "@/components/account/account-data-section";
import { AccountPasswordForm } from "@/components/account/account-password-form";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";

const ACCOUNT_SECTIONS = [
  {
    value: "profile",
    label: "Profile",
    icon: UserRoundIcon,
  },
  {
    value: "security",
    label: "Security",
    icon: LockIcon,
  },
  {
    value: "data",
    label: "Data",
    icon: DatabaseIcon,
  },
] as const;

/**
 * Account settings — vertical rail on desktop, horizontal tabs on mobile.
 *
 * Surface: operational · Archetype: vertical rail settings · Containers: Frame
 * Regions: section rail · one focused content panel
 */
export const AccountSettings = () => {
  const { user } = useAuth();
  const isMdUp = useMediaQuery("(min-width: 768px)");

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile, security, and data.
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        orientation={isMdUp ? "vertical" : "horizontal"}
        className="min-w-0 gap-6 md:items-start"
      >
        <TabsList
          variant="line"
          aria-label="Account sections"
          className="w-full justify-start md:w-44 md:shrink-0"
        >
          {ACCOUNT_SECTIONS.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              <section.icon data-icon="inline-start" aria-hidden="true" />
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <AccountProfileForm user={user} />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <AccountPasswordForm />
          </TabsContent>
          <TabsContent value="data" className="mt-0">
            <AccountDataSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
