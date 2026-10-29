"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NoteEditorProps = {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

type ToolbarButtonProps = {
  readonly label: string;
  readonly shortcut?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
};

const ToolbarButton = ({
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant={active ? "secondary" : "ghost"}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">
        <span>{label}</span>
        {shortcut ? (
          <span className="ms-1.5 text-background/70">{shortcut}</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * TipTap note editor with formatting toolbar and tooltips.
 */
export const NoteEditor = ({
  value,
  onChange,
  placeholder = "What happened? Follow-up, interview notes, offer details…",
  disabled = false,
  className,
}: NoteEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "tiptap min-h-44 px-3 py-2.5 text-sm leading-relaxed focus:outline-none",
          "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
          "[&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
          "[&_strong]:font-semibold [&_em]:italic",
        ),
        "aria-label": "Note editor",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const handleSetLink = () => {
    if (!editor) {
      return;
    }

    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Link URL", previous ?? "https://");

    if (next === null) {
      return;
    }

    const trimmed = next.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-56 rounded-lg border border-input bg-transparent",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-transparent shadow-xs",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 px-1.5 py-1">
        <ToolbarButton
          label="Bold"
          shortcut="⌘B"
          active={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          shortcut="⌘I"
          active={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          label="Insert link"
          active={editor.isActive("link")}
          disabled={disabled}
          onClick={handleSetLink}
        >
          <LinkIcon />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
