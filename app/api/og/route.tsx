import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "OmniKit";
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
        background: "linear-gradient(135deg, #0b0f1a, #111827)",
        padding: "60px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#06d6a0 0.5px, transparent 0.5px), linear-gradient(90deg, #06d6a0 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
          opacity: 0.03,
        }}
      />

      <svg width="320" height="160" viewBox="-240 -100 480 200" style={{ marginBottom: 32 }}>
        <defs>
          <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="35%" stopColor="#06d6a0" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="65%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06d6a0" />
          </linearGradient>
        </defs>
        <path
          d="M0 55 C0 100 -44 138 -100 138 C-170 138 -220 88 -220 28 C-220 -32 -170 -82 -100 -82 C-44 -82 0 -44 0 0 C0 -44 44 -82 100 -82 C170 -82 220 -32 220 28 C220 88 170 138 100 138 C44 138 0 100 0 55Z"
          fill="none"
          stroke="url(#r)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "monospace",
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "-1.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: 140,
          height: 3,
          borderRadius: 1.5,
          background: "#06d6a0",
          marginTop: 12,
          marginBottom: 20,
        }}
      />

      <div
        style={{
          fontSize: 22,
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 700,
        }}
      >
        {desc}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#06d6a0",
          opacity: 0.4,
          marginTop: "auto",
          letterSpacing: "0.05em",
        }}
      >
        omnikit.run
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
