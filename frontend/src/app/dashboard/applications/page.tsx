import { Suspense } from "react";

import { ApplicationsWorkspace } from "@/components/applications/applications-workspace";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Applications page inside the dashboard shell.
 */
const DashboardApplicationsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ApplicationsWorkspace />
    </Suspense>
  );
};

export default DashboardApplicationsPage;
