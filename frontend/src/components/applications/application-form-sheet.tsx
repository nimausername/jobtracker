"use client";

import { LinkIcon } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { ApplicationStatusSelect } from "@/components/applications/application-status-select";
import { NoteEditor } from "@/components/applications/note-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  WorkArrangement,
} from "@/lib/api/applications";
import { WORK_ARRANGEMENTS } from "@/lib/api/applications";
import {
  isEmptyNoteHtml,
  sanitizeNoteHtml,
} from "@/lib/applications/sanitize-note-html";
import {
  workArrangementDescription,
  workArrangementLabel,
} from "@/lib/applications/work-arrangement";

type ApplicationFormSheetProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly initial?: Application | null;
  readonly onSubmit: (input: ApplicationInput) => Promise<void>;
};

type FormState = {
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  city: string;
  country: string;
  workArrangement: WorkArrangement;
  status: ApplicationStatus;
  notes: string;
};

const emptyForm = (): FormState => ({
  companyName: "",
  jobTitle: "",
  jobUrl: "",
  city: "",
  country: "",
  workArrangement: "onsite",
  status: "wishlist",
  notes: "",
});

const isWorkArrangement = (value: string): value is WorkArrangement =>
  (WORK_ARRANGEMENTS as readonly string[]).includes(value);

/**
 * Create/edit sheet for a job application with Field-based form layout.
 */
export const ApplicationFormSheet = ({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: ApplicationFormSheetProps) => {
  const formId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notesEditorKey, setNotesEditorKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initial) {
      setForm({
        companyName: initial.companyName,
        jobTitle: initial.jobTitle,
        jobUrl: initial.jobUrl ?? "",
        city: initial.city ?? "",
        country: initial.country ?? "",
        workArrangement: initial.workArrangement,
        status: initial.status,
        notes: initial.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
    setNotesEditorKey((prev) => prev + 1);
    setError(null);
  }, [open, initial]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const sanitizedNotes = sanitizeNoteHtml(form.notes);
    const notes = isEmptyNoteHtml(sanitizedNotes) ? undefined : sanitizedNotes;

    try {
      await onSubmit({
        companyName: form.companyName.trim(),
        jobTitle: form.jobTitle.trim(),
        jobUrl: form.jobUrl.trim() || undefined,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        workArrangement: form.workArrangement,
        status: form.status,
        notes: initial ? (notes ?? "") : notes,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyId = `${formId}-company`;
  const titleId = `${formId}-title`;
  const urlId = `${formId}-url`;
  const cityId = `${formId}-city`;
  const countryId = `${formId}-country`;
  const statusId = `${formId}-status`;
  const arrangementId = `${formId}-arrangement`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {initial ? "Edit application" : "Add application"}
          </SheetTitle>
          <SheetDescription>
            Track company, role, location, and pipeline status.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-2">
            <FieldGroup className="gap-5">
              <FieldSet>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor={companyId}>Company</FieldLabel>
                    <Input
                      id={companyId}
                      value={form.companyName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          companyName: event.target.value,
                        }))
                      }
                      placeholder="Acme GmbH"
                      autoComplete="organization"
                      required
                      disabled={isSubmitting}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={titleId}>Job title</FieldLabel>
                    <Input
                      id={titleId}
                      value={form.jobTitle}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          jobTitle: event.target.value,
                        }))
                      }
                      placeholder="Senior Frontend Engineer"
                      required
                      disabled={isSubmitting}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={urlId}>Job URL</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <LinkIcon aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={urlId}
                        type="url"
                        inputMode="url"
                        placeholder="https://careers.company.com/role"
                        value={form.jobUrl}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            jobUrl: event.target.value,
                          }))
                        }
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                    <FieldDescription>
                      Optional link to the posting.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator>Location</FieldSeparator>

              <FieldSet>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel id={`${arrangementId}-label`}>
                      Work arrangement
                    </FieldLabel>
                    <RadioGroup
                      value={form.workArrangement}
                      disabled={isSubmitting}
                      aria-labelledby={`${arrangementId}-label`}
                      className="grid gap-2 sm:grid-cols-3"
                      onValueChange={(value) => {
                        if (!value || !isWorkArrangement(value)) {
                          return;
                        }

                        setForm((prev) => ({
                          ...prev,
                          workArrangement: value,
                        }));
                      }}
                    >
                      {WORK_ARRANGEMENTS.map((arrangement) => {
                        const optionId = `${arrangementId}-${arrangement}`;

                        return (
                          <Field
                            key={arrangement}
                            orientation="horizontal"
                            className="rounded-lg border border-border px-3 py-2.5 has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
                          >
                            <RadioGroupItem
                              value={arrangement}
                              id={optionId}
                            />
                            <FieldLabel
                              htmlFor={optionId}
                              className="font-normal"
                            >
                              {workArrangementLabel[arrangement]}
                            </FieldLabel>
                          </Field>
                        );
                      })}
                    </RadioGroup>
                    <FieldDescription>
                      {workArrangementDescription[form.workArrangement]}
                    </FieldDescription>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={cityId}>City</FieldLabel>
                      <Input
                        id={cityId}
                        value={form.city}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            city: event.target.value,
                          }))
                        }
                        placeholder="München"
                        autoComplete="address-level2"
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={countryId}>Country</FieldLabel>
                      <Input
                        id={countryId}
                        value={form.country}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            country: event.target.value,
                          }))
                        }
                        placeholder="Germany"
                        autoComplete="country-name"
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator>Pipeline</FieldSeparator>

              <FieldSet>
                <Field>
                  <FieldLabel htmlFor={statusId}>Status</FieldLabel>
                  <ApplicationStatusSelect
                    id={statusId}
                    value={form.status}
                    size="default"
                    variant="field"
                    aria-label="Application status"
                    disabled={isSubmitting}
                    onValueChange={(status) =>
                      setForm((prev) => ({ ...prev, status }))
                    }
                  />
                  <FieldDescription>
                    Starting stage for this role in your tracker.
                  </FieldDescription>
                </Field>
              </FieldSet>

              <FieldSeparator>Role notes</FieldSeparator>

              <FieldSet>
                <Field>
                  <FieldLabel>Role notes</FieldLabel>
                  <NoteEditor
                    key={notesEditorKey}
                    value={form.notes}
                    onChange={(html) =>
                      setForm((prev) => ({ ...prev, notes: html }))
                    }
                    placeholder="Salary range, referral, must-have skills…"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Optional context for this role. Activity updates are added
                    later from the application page.
                  </FieldDescription>
                </Field>
              </FieldSet>

              {error ? <FieldError>{error}</FieldError> : null}
            </FieldGroup>
          </div>

          <SheetFooter className="border-t">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
