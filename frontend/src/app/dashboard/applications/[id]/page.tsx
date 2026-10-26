"use client";

import { use } from "react";

import { ApplicationDetail } from "@/components/applications/application-detail";

type ApplicationDetailPageProps = {
  readonly params: Promise<{ id: string }>;
};

/**
 * Application detail + timeline route.
 */
const ApplicationDetailPage = ({ params }: ApplicationDetailPageProps) => {
  const { id } = use(params);
  return <ApplicationDetail applicationId={id} />;
};

export default ApplicationDetailPage;
