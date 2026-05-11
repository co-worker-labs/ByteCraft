import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "OmniKit";
  const icon = searchParams.get("icon") || "🛠️";
  const desc = searchParams.get("desc") || "Free Online Developer Tools";

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #0b0f1a, #111827)",
        padding: "60px",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 24, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "monospace",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#94a3b8",
          marginTop: 16,
          maxWidth: 860,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {desc}
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#06d6a0",
          marginTop: "auto",
          letterSpacing: "0.05em",
        }}
      >
        OmniKit · omnikit.run
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
