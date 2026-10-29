"use client";

import { useEffect, useState, type FormEvent } from "react";

import { NoteEditor } from "@/components/applications/note-editor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  isEmptyNoteHtml,
  sanitizeNoteHtml,
} from "@/lib/applications/sanitize-note-html";
import { cn } from "@/lib/utils";

type ApplicationRoleNotesSheetProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly initialBody: string | null;
  readonly onSubmit: (body: string) => Promise<void>;
};

/**
 * Sheet for creating or editing the application-level role notes.
 */
export const ApplicationRoleNotesSheet = ({
  open,
  onOpenChange,
  initialBody,
  onSubmit,
}: ApplicationRoleNotesSheetProps) => {
  const isEditing = Boolean(initialBody?.trim());
  const [noteBody, setNoteBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNoteBody(initialBody ?? "");
    setEditorKey((prev) => prev + 1);
  }, [open, initialBody]);

  const canSave = !isEmptyNoteHtml(noteBody);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || isSaving) {
      return;
    }

    const sanitized = sanitizeNoteHtml(noteBody);
    if (isEmptyNoteHtml(sanitized)) {
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(sanitized);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit role notes" : "Add role notes"}</SheetTitle>
          <SheetDescription>
            Private summary for this role — separate from the activity timeline.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
            <Label>Role notes</Label>
            <NoteEditor
              key={editorKey}
              value={noteBody}
              onChange={setNoteBody}
              placeholder="Salary range, referral, must-have skills…"
              disabled={isSaving}
            />
          </div>

          <SheetFooter className="border-t">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !canSave}
                className={cn(!canSave && "opacity-60")}
              >
                {isSaving ? "Saving…" : "Save notes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
