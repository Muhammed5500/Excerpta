import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const SUMMARIES_PATH = join(process.cwd(), "src/data/summaries.json");

async function getSummaries(): Promise<Record<string, string>> {
  try {
    const data = await readFile(SUMMARIES_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function GET() {
  const summaries = await getSummaries();
  return NextResponse.json(summaries);
}

export async function POST(request: Request) {
  const { articleId, summary } = await request.json();

  if (!articleId || typeof summary !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const summaries = await getSummaries();
  summaries[articleId] = summary;

  await writeFile(SUMMARIES_PATH, JSON.stringify(summaries, null, 2));

  return NextResponse.json({ success: true });
}
