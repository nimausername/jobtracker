import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { SITE_INFO } from "@/lib/legal/site-info";

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_CONTENT_TYPE = "image/png";

export const OG_ALT =
  "Job Tracker — Keep every application in one place. Open source and self-hosted.";

const fontsDir = join(process.cwd(), "src/assets/fonts");

/**
 * Loads local brand fonts for OG / Twitter card rendering.
 */
const loadOgFonts = async () => {
  const [jakartaMedium, jakartaSemiBold, schoolbell] = await Promise.all([
    readFile(join(fontsDir, "plus-jakarta-sans-500.ttf")),
    readFile(join(fontsDir, "plus-jakarta-sans-600.ttf")),
    readFile(join(fontsDir, "schoolbell-400.ttf")),
  ]);

  return [
    {
      name: "Plus Jakarta Sans",
      data: jakartaMedium,
      style: "normal" as const,
      weight: 500 as const,
    },
    {
      name: "Plus Jakarta Sans",
      data: jakartaSemiBold,
      style: "normal" as const,
      weight: 600 as const,
    },
    {
      name: "Schoolbell",
      data: schoolbell,
      style: "normal" as const,
      weight: 400 as const,
    },
  ];
};

/**
 * Social card matching the landing hero copy and branding.
 */
export const createHomeOgImage = async (): Promise<ImageResponse> => {
  const fonts = await loadOgFonts();
  const host = SITE_INFO.productionUrl.replace(/^https:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#070b14",
          color: "#f6f8ff",
          padding: "52px 64px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 11,
                background: "#1e3fd8",
                color: "#f6f8ff",
                fontFamily: "Plus Jakarta Sans",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.04em",
              }}
            >
              J
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Plus Jakarta Sans",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              {SITE_INFO.productName}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              padding: "10px 18px",
              fontFamily: "Plus Jakarta Sans",
              fontSize: 18,
              fontWeight: 500,
              color: "rgba(246,248,255,0.88)",
            }}
          >
            Open source & self-hosted
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 920,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "baseline",
                gap: 14,
                fontFamily: "Plus Jakarta Sans",
                fontSize: 58,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#ffffff",
              }}
            >
              <span style={{ display: "flex" }}>Keep every</span>
              <span
                style={{
                  display: "flex",
                  fontFamily: "Schoolbell",
                  fontWeight: 400,
                  fontSize: 66,
                  lineHeight: 1,
                  color: "#a5d8ff",
                }}
              >
                application
              </span>
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Plus Jakarta Sans",
                fontSize: 58,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#ffffff",
              }}
            >
              in one place
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 760,
              fontFamily: "Plus Jakarta Sans",
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.45,
              color: "rgba(246,248,255,0.72)",
            }}
          >
            Track status, notes, and follow-ups for jobs anywhere in the world —
            starting with a clean, open-source pipeline.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Plus Jakarta Sans",
              fontSize: 20,
              fontWeight: 500,
              color: "rgba(246,248,255,0.42)",
            }}
          >
            {host}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#38bdf8",
              }}
            />
            <div
              style={{
                display: "flex",
                fontFamily: "Plus Jakarta Sans",
                fontSize: 20,
                fontWeight: 500,
                color: "rgba(246,248,255,0.5)",
              }}
            >
              Self-hosted pipeline
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
    },
  );
};
