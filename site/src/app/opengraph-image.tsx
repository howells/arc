import { ImageResponse } from "next/og";

export const alt = "Arc – The full arc from idea to shipped code";
export const size = {
  height: 630,
  width: 1200,
};
export const contentType = "image/png";

export default async function Image() {
  const ibmPlexMono = await fetch(
    "https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div
      style={{
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      {/* Command heading */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          fontFamily: "IBM Plex Mono",
          fontSize: "96px",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: "#262626" }}>/arc</span>
        <span style={{ color: "#5A7B7B" }}>:</span>
        <span style={{ color: "#5A7B7B" }}>go</span>
      </div>

      {/* Bottom line */}
      <p
        style={{
          color: "#737373",
          fontFamily: "IBM Plex Mono",
          fontSize: "22px",
          fontWeight: 400,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}
      >
        The full arc from idea to shipped code. For Claude Code and Codex.
      </p>
    </div>,
    {
      ...size,
      fonts: [
        {
          data: ibmPlexMono,
          name: "IBM Plex Mono",
          style: "normal" as const,
          weight: 400,
        },
      ],
    }
  );
}
