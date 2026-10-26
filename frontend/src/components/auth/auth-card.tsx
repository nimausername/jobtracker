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
 * Shared auth card shell adapted from ReUI c-card-12 for the ASCII background.
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
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
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
