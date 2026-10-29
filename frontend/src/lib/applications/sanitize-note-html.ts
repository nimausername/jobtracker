import DOMPurify from "isomorphic-dompurify";

const NOTE_HTML_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
] as const;

/**
 * Sanitizes rich-note HTML for safe storage and display.
 */
export const sanitizeNoteHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...NOTE_HTML_TAGS],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  }).trim();

/**
 * Returns true when the editor HTML has no meaningful text content.
 */
export const isEmptyNoteHtml = (html: string): boolean => {
  const text = sanitizeNoteHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length === 0;
};

/**
 * Detects whether a stored note body is HTML versus legacy plain text.
 */
export const isNoteHtml = (body: string): boolean =>
  /<\/?[a-z][\s\S]*>/i.test(body);
