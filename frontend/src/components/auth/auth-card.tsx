import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
  readonly footer: ReactNode;
  readonly className?: string;
};

/**
 * Glass auth form shell for the ASCII marketing stage (ReUI Card / c-card-12).
 * Brand lives in AuthPageShell; this card owns the task title and form only.
 */
export const AuthCard = ({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) => {
  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-sm border-0 bg-background/90 shadow-lg ring-1 ring-white/15 backdrop-blur-md",
        className,
      )}
    >
      <CardHeader className="gap-1 text-center sm:text-left">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="border-white/10 bg-transparent">
        <div className="w-full text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </CardFooter>
    </Card>
  );
};
