"use client";

import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  ExternalLinkIcon,
  MapPinIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Frame, FramePanel } from "@/components/reui/frame";
import type { Application } from "@/lib/api/applications";
import { formatWorkLocation } from "@/lib/applications/work-arrangement";

type ApplicationRoleMetaProps = {
  readonly application: Application;
};

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(iso));

type MetaItemProps = {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly children: ReactNode;
};

const MetaItem = ({ label, icon: Icon, children }: MetaItemProps) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </dt>
    <dd className="mt-0.5 truncate text-sm font-medium">{children}</dd>
  </div>
);

/**
 * Compact role facts strip for the application detail page.
 */
export const ApplicationRoleMeta = ({
  application,
}: ApplicationRoleMetaProps) => {
  const location = formatWorkLocation({
    workArrangement: application.workArrangement,
    city: application.city,
    country: application.country,
  });

  return (
    <Frame className="min-w-0" spacing="sm">
      <FramePanel>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem label="Location" icon={MapPinIcon}>
            {location}
          </MetaItem>
          <MetaItem label="Added" icon={CalendarPlusIcon}>
            {formatDate(application.createdAt)}
          </MetaItem>
          <MetaItem label="Applied" icon={CalendarCheckIcon}>
            {application.appliedAt
              ? formatDate(application.appliedAt)
              : "Not set"}
          </MetaItem>
          <MetaItem label="Job link" icon={ExternalLinkIcon}>
            {application.jobUrl ? (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-4"
              >
                Open posting
              </a>
            ) : (
              "—"
            )}
          </MetaItem>
        </dl>
      </FramePanel>
    </Frame>
  );
};
