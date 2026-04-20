/**
 * Shared icon design — ink background, thin cream frame, 定 kanji centered.
 * Used by app/icon.tsx (browser tab favicon) and app/apple-icon.tsx
 * (iOS home-screen icon). Same mark, different sizes.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const INK = "#141414";
const CREAM = "#ece8df";

export async function renderIcon(size: number) {
  const fontData = await readFile(
    join(process.cwd(), "assets/ShipporiMincho-tei.ttf")
  );

  const inset = Math.max(1, Math.round(size * 0.06));
  const borderW = Math.max(1, Math.round(size * 0.015));
  const kanjiSize = Math.round(size * 0.64);

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
            fontFamily: "Shippori Mincho",
            fontSize: kanjiSize,
            color: CREAM,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          定
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Shippori Mincho",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
