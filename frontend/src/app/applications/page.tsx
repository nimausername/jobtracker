import { redirect } from "next/navigation";

/**
 * Legacy route — send users to the dashboard applications view.
 */
const LegacyApplicationsRedirect = () => {
  redirect("/dashboard/applications");
};

export default LegacyApplicationsRedirect;
