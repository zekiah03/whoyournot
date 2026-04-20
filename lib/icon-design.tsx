/**
 * Shared icon design — ink field, thin cream frame, horizontal ornament
 * (line — dot — line) centered. This is the same mark used inside the
 * ShareCard, so the app, the tab, and the certificate all share one glyph.
 * Used by app/icon.tsx (browser tab) and app/apple-icon.tsx (iOS home).
 */
import { ImageResponse } from "next/og";

const INK = "#141414";
const CREAM = "#ece8df";

export function renderIcon(size: number) {
  const inset = Math.max(1, Math.round(size * 0.08));
  const borderW = Math.max(1, Math.round(size * 0.015));

  // Ornament geometry (scaled to icon size).
  const ornamentWidth = Math.round(size * 0.56);
  const lineLen = Math.round(ornamentWidth * 0.38);
  const gap = Math.round(ornamentWidth * 0.08);
  const dot = Math.max(3, Math.round(size * 0.045));
  const strokeW = Math.max(1, Math.round(size * 0.018));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: inset,
            left: inset,
            right: inset,
            bottom: inset,
            border: `${borderW}px solid ${CREAM}`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap,
          }}
        >
          <div
            style={{
              width: lineLen,
              height: strokeW,
              background: CREAM,
            }}
          />
          <div
            style={{
              width: dot,
              height: dot,
              borderRadius: dot,
              background: CREAM,
            }}
          />
          <div
            style={{
              width: lineLen,
              height: strokeW,
              background: CREAM,
            }}
          />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
