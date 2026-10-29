import { ImageResponse } from "next/og";

/**
 * Single app favicon for Job Tracker (served at /icon).
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
          letterSpacing: "-0.04em",
        }}
      >
        J
      </div>
    ),
    size,
  );
};

export default Icon;
