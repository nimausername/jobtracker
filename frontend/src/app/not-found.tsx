import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Global 404 page.
 */
const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <Link href="/" className={cn(buttonVariants())}>
        Back home
      </Link>
    </main>
  );
};

export default NotFoundPage;
