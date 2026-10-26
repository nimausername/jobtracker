import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

/**
 * Authenticated shell with shadcn sidebar and dynamic breadcrumbs.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
};

export default DashboardLayout;
