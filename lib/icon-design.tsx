/**
 * Icon: concentric mark — thin ring + filled center dot.
 * Used by app/apple-icon.tsx to render a PNG; app/icon.svg ships the
 * same geometry as a static SVG for browser tabs.
 */
import { ImageResponse } from "next/og";

const INK = "#141414";
const CREAM = "#ece8df";

export function renderIcon(size: number) {
  // Geometry in icon units, scaled to `size`.
  const ringRadius = size * 0.3125; // r=20 at 64
  const ringStroke = Math.max(2, Math.round(size * 0.039)); // 2.5 at 64
  const dotRadius = size * 0.07; // r=4.5 at 64

  const ringOuter = Math.round(ringRadius * 2);
  const dotOuter = Math.round(dotRadius * 2);

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
            width: ringOuter,
            height: ringOuter,
            borderRadius: ringOuter,
            border: `${ringStroke}px solid ${CREAM}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: dotOuter,
              height: dotOuter,
              borderRadius: dotOuter,
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
