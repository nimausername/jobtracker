"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  isNoteHtml,
  sanitizeNoteHtml,
} from "@/lib/applications/sanitize-note-html";
import { cn } from "@/lib/utils";

type NoteBodyProps = {
  readonly body: string;
  readonly clampLines?: 2 | 3;
  readonly className?: string;
};

/**
 * Clamped rich/plain note body with Show more / Show less.
 */
export const NoteBody = ({
  body,
  clampLines = 3,
  className,
}: NoteBodyProps) => {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const htmlBody = isNoteHtml(body);
  const safeHtml = htmlBody ? sanitizeNoteHtml(body) : null;
  const clampClass = clampLines === 2 ? "line-clamp-2" : "line-clamp-3";

  useEffect(() => {
    const element = bodyRef.current;
    if (!element) {
      setOverflows(false);
      return;
    }

    if (expanded) {
      return;
    }

    setOverflows(element.scrollHeight > element.clientHeight + 1);
  }, [body, expanded, safeHtml]);

  return (
    <div className={className}>
      {safeHtml ? (
        <div
          ref={bodyRef}
          className={cn(
            "text-sm text-muted-foreground",
            "[&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5",
            "[&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
            "[&_strong]:font-semibold [&_em]:italic",
            !expanded && clampClass,
          )}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : (
        <div
          ref={bodyRef}
          className={cn(
            "text-sm text-muted-foreground whitespace-pre-wrap",
            !expanded && clampClass,
          )}
        >
          {body}
        </div>
      )}
      {overflows || expanded ? (
        <Button
          type="button"
          variant="link"
          size="xs"
          className="mt-1 h-auto px-0"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      ) : null}
    </div>
  );
};
