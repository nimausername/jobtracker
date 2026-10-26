import { ImageResponse } from "next/og";

/**
 * App icon — avoids a broken favicon placeholder in the browser chrome.
 */
export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

const Icon = () => {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3fd8",
          color: "#f6f8ff",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        J
      </div>
    ),
    size,
  );
};

export default Icon;
