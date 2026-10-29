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
import type { ApplicationNote } from "@/lib/api/notes";
import {
  isEmptyNoteHtml,
  sanitizeNoteHtml,
} from "@/lib/applications/sanitize-note-html";
import { cn } from "@/lib/utils";

type ApplicationNoteEditSheetProps = {
  readonly note: ApplicationNote | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (body: string) => Promise<void>;
};

/**
 * Sheet for editing an existing timeline note.
 */
export const ApplicationNoteEditSheet = ({
  note,
  open,
  onOpenChange,
  onSubmit,
}: ApplicationNoteEditSheetProps) => {
  const [noteBody, setNoteBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!open || !note) {
      return;
    }

    setNoteBody(note.body);
    setEditorKey((prev) => prev + 1);
  }, [open, note]);

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
          <SheetTitle>Edit note</SheetTitle>
          <SheetDescription>
            Update this timeline note. Formatting is preserved.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
            <Label>Note</Label>
            <NoteEditor
              key={editorKey}
              value={noteBody}
              onChange={setNoteBody}
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
                {isSaving ? "Saving…" : "Save note"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
