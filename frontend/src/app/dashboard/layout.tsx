import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

/**
 * Authenticated shell with shadcn sidebar.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
};

export default DashboardLayout;
