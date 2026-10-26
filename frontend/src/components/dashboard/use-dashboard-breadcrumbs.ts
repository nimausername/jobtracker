"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { getApplication } from "@/lib/api/applications";

export type BreadcrumbCrumb = {
  readonly href?: string;
  readonly label: string;
  readonly isCurrent: boolean;
};

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  applications: "Applications",
  account: "Account",
};

const isLikelyId = (segment: string): boolean =>
  /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);

/**
 * Builds dashboard breadcrumbs from the current route.
 * Application detail crumbs resolve the company + role dynamically.
 */
export const useDashboardBreadcrumbs = (): {
  readonly crumbs: BreadcrumbCrumb[];
  readonly isResolvingLabel: boolean;
} => {
  const pathname = usePathname();
  const [detailLabel, setDetailLabel] = useState<string | null>(null);
  const [isResolvingLabel, setIsResolvingLabel] = useState(false);

  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );

  const applicationId = useMemo(() => {
    if (segments[0] !== "dashboard" || segments[1] !== "applications") {
      return null;
    }

    const candidate = segments[2];
    return candidate && isLikelyId(candidate) ? candidate : null;
  }, [segments]);

  useEffect(() => {
    if (!applicationId) {
      setDetailLabel(null);
      setIsResolvingLabel(false);
      return;
    }

    let cancelled = false;
    setIsResolvingLabel(true);
    setDetailLabel(null);

    const load = async () => {
      try {
        const application = await getApplication(applicationId);
        if (cancelled) {
          return;
        }

        setDetailLabel(
          `${application.companyName} · ${application.jobTitle}`,
        );
      } catch {
        if (!cancelled) {
          setDetailLabel("Application");
        }
      } finally {
        if (!cancelled) {
          setIsResolvingLabel(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const crumbs = useMemo(() => {
    if (segments[0] !== "dashboard") {
      return [
        {
          label: "Dashboard",
          href: "/dashboard",
          isCurrent: true,
        },
      ];
    }

    const items: BreadcrumbCrumb[] = [];
    let href = "";

    segments.forEach((segment, index) => {
      href += `/${segment}`;
      const isLast = index === segments.length - 1;
      const isApplicationDetail =
        Boolean(applicationId) && segment === applicationId;

      let label = ROUTE_LABELS[segment] ?? segment;

      if (isApplicationDetail) {
        label =
          detailLabel ??
          (isResolvingLabel ? "Loading…" : "Application");
      }

      items.push({
        href: isLast ? undefined : href,
        label,
        isCurrent: isLast,
      });
    });

    return items;
  }, [applicationId, detailLabel, isResolvingLabel, segments]);

  return { crumbs, isResolvingLabel };
};
