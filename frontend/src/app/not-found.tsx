import {
  StatusHomeLink,
  StatusPage,
} from "@/components/status/status-page";

/**
 * Global 404 page with branded ShapeWaves background.
 */
const NotFoundPage = () => {
  return (
    <StatusPage
      maskText="404"
      title="Page not found"
      description="That route does not exist, or it moved. Head back home and pick up where you left off."
      primaryAction={<StatusHomeLink />}
    />
  );
};

export default NotFoundPage;
