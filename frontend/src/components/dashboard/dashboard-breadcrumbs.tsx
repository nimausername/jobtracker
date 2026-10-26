"use client";

import Link from "next/link";
import { Fragment } from "react";

import { useDashboardBreadcrumbs } from "@/components/dashboard/use-dashboard-breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Dynamic dashboard breadcrumb trail using shadcn Breadcrumb + Next.js links.
 * Pattern adapted from ReUI c-breadcrumb-3.
 */
export const DashboardBreadcrumbs = () => {
  const { crumbs } = useDashboardBreadcrumbs();

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="sm:gap-2.5">
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem className="min-w-0">
              {crumb.isCurrent || !crumb.href ? (
                <BreadcrumbPage className="max-w-[12rem] truncate sm:max-w-[20rem] md:max-w-md">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link href={crumb.href} />}
                  className="max-w-[10rem] truncate sm:max-w-[14rem]"
                >
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
