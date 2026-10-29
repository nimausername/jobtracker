"use client";

import { CircleHelpIcon } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { ApplicationStatusSelect } from "@/components/applications/application-status-select";
import { NoteEditor } from "@/components/applications/note-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ApplicationStatus } from "@/lib/api/applications";
import { ACTIVITY_TEMPLATES } from "@/lib/applications/activity-templates";
import {
  isEmptyNoteHtml,
  sanitizeNoteHtml,
} from "@/lib/applications/sanitize-note-html";
import { cn } from "@/lib/utils";

export type ApplicationUpdatePayload = {
  readonly body?: string;
  readonly status?: ApplicationStatus;
};

type ApplicationUpdateSheetProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentStatus: ApplicationStatus;
  readonly jobTitle: string;
  readonly companyName: string;
  readonly onSubmit: (payload: ApplicationUpdatePayload) => Promise<void>;
};

/**
 * Drawer for logging rich notes and optional status changes.
 */
export const ApplicationUpdateSheet = ({
  open,
  onOpenChange,
  currentStatus,
  jobTitle,
  companyName,
  onSubmit,
}: ApplicationUpdateSheetProps) => {
  const formId = useId();
  const [noteBody, setNoteBody] = useState("");
  const [draftStatus, setDraftStatus] =
    useState<ApplicationStatus>(currentStatus);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNoteBody("");
    setDraftStatus(currentStatus);
    setTemplateKey(null);
    setEditorKey((prev) => prev + 1);
  }, [open, currentStatus]);

  const hasNote = !isEmptyNoteHtml(noteBody);
  const statusChanged = draftStatus !== currentStatus;
  const canSave = hasNote || statusChanged;

  const statusId = `${formId}-status`;
  const templateId = `${formId}-template`;

  const handleTemplateChange = (next: string | null) => {
    if (!next) {
      setTemplateKey(null);
      return;
    }

    const template = ACTIVITY_TEMPLATES.find((item) => item.id === next);
    if (!template) {
      return;
    }

    const paragraph = `<p>${template.body}</p>`;
    setNoteBody((prev) => {
      if (isEmptyNoteHtml(prev)) {
        return paragraph;
      }

      return `${prev}${paragraph}`;
    });
    setTemplateKey(null);
    setEditorKey((prev) => prev + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const sanitized = hasNote ? sanitizeNoteHtml(noteBody) : undefined;
      await onSubmit({
        body: sanitized && !isEmptyNoteHtml(sanitized) ? sanitized : undefined,
        status: statusChanged ? draftStatus : undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add update</SheetTitle>
          <SheetDescription>
            Log timeline activity for {jobTitle} at {companyName}. Role notes
            stay on the application itself.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-2">
            <FieldGroup className="gap-5">
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor={statusId}>Status</FieldLabel>
                  <ApplicationStatusSelect
                    id={statusId}
                    value={draftStatus}
                    size="default"
                    variant="field"
                    aria-label="Update application status"
                    disabled={isSaving}
                    onValueChange={setDraftStatus}
                  />
                  <FieldDescription>
                    Leave as-is to keep the current pipeline stage.
                  </FieldDescription>
                </Field>
              </FieldSet>

              <FieldSeparator>Timeline note</FieldSeparator>

              <FieldSet>
                <FieldGroup className="gap-4">
                  <Field>
                    <div className="flex items-center gap-1.5">
                      <FieldLabel htmlFor={templateId}>Template</FieldLabel>
                      <Tooltip>
                        <TooltipTrigger
                          type="button"
                          className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="About templates"
                        >
                          <CircleHelpIcon className="size-3.5" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-56">
                          Insert a common follow-up into your note. Edit freely
                          before saving.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={templateKey}
                      onValueChange={handleTemplateChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger
                        id={templateId}
                        className="w-full"
                        aria-label="Insert note template"
                      >
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Optional shortcut — inserts into the note below.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Note</FieldLabel>
                    <NoteEditor
                      key={editorKey}
                      value={noteBody}
                      onChange={setNoteBody}
                      disabled={isSaving}
                    />
                    <FieldDescription>
                      Appears on the activity timeline with a timestamp —
                      separate from role notes.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
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
                {isSaving ? "Saving…" : "Save update"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
