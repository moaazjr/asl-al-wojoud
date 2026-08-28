import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/data/site";

export const alt = `${siteConfig.workTitle} — تأليف ${siteConfig.author}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const amiriRegular = readFile(join(process.cwd(), "app", "fonts", "Amiri-Regular.ttf"));
const amiriBold = readFile(join(process.cwd(), "app", "fonts", "Amiri-Bold.ttf"));

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([amiriRegular, amiriBold]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f2e9",
          fontFamily: "Amiri",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            bottom: 28,
            left: 28,
            border: "1px solid #ddd4c0",
          }}
        />        <div
          style={{
            position: "absolute",
            top: 42,
            right: 42,
            bottom: 42,
            left: 42,
            border: "2px solid #9a7b2e",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#6b5320",
          }}
        >
          منظومةٌ استقرائيةٌ في تدبّر كتاب الله
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 148,
            fontWeight: 700,
            color: "#2a2620",
          }}
        >
          أصل الوجود
        </div>

        <div style={{ display: "flex", marginTop: 30, alignItems: "center" }}>
          <div
            style={{ width: 96, height: 2, backgroundColor: "#9a7b2e", opacity: 0.65 }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              marginRight: 20,
              marginLeft: 20,
              backgroundColor: "#9a7b2e",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{ width: 96, height: 2, backgroundColor: "#9a7b2e", opacity: 0.65 }}
          />
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 40,
            color: "#5c554a",
          }}
        >
          تأليف منذر الصبّاغ — دمشق ٢٠٢٦
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Amiri", data: regular, weight: 400, style: "normal" },
        { name: "Amiri", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
