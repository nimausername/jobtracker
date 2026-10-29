/**
 * Quick-add timeline templates for common job-search actions.
 */
export const ACTIVITY_TEMPLATES = [
  {
    id: "follow-up-sent",
    label: "Follow-up sent",
    body: "Sent a follow-up message to the recruiter or hiring manager.",
  },
  {
    id: "recruiter-replied",
    label: "Recruiter replied",
    body: "Heard back from the recruiter.",
  },
  {
    id: "phone-screen",
    label: "Phone screen",
    body: "Completed a phone or screening call.",
  },
  {
    id: "interview-scheduled",
    label: "Interview scheduled",
    body: "Interview scheduled. Waiting for the meeting.",
  },
  {
    id: "interview-done",
    label: "Interview done",
    body: "Completed an interview round.",
  },
  {
    id: "take-home",
    label: "Take-home task",
    body: "Received or submitted a take-home assignment.",
  },
  {
    id: "offer-details",
    label: "Offer details",
    body: "Discussed offer details or compensation.",
  },
  {
    id: "reference-check",
    label: "Reference check",
    body: "Reference check requested or completed.",
  },
] as const;

export type ActivityTemplateId = (typeof ACTIVITY_TEMPLATES)[number]["id"];
