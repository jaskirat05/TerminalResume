import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Reads from disk, so keep this on the Node.js runtime.
export const runtime = "nodejs";

export async function GET() {
  try {
    const knowledgeDir = join(process.cwd(), "knowledge");
    const fileName = readdirSync(knowledgeDir).find((f) =>
      f.toLowerCase().endsWith(".docx"),
    );

    if (!fileName) {
      return NextResponse.json({ message: "Resume not found." }, { status: 404 });
    }

    const file = readFileSync(join(knowledgeDir, fileName));

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": file.length.toString(),
      },
    });
  } catch (error) {
    console.error("[download] error:", error);
    return NextResponse.json(
      { message: "Failed to download resume." },
      { status: 500 },
    );
  }
}
