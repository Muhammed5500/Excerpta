import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const TAGS_PATH = join(process.cwd(), "src/data/tags.json");

// { articleId: string[] }
async function getTags(): Promise<Record<string, string[]>> {
  try {
    const data = await readFile(TAGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function GET() {
  const tags = await getTags();
  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const { articleId, tags: newTags } = await request.json();

  if (!articleId || !Array.isArray(newTags)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const allTags = await getTags();
  allTags[articleId] = newTags.map((t: string) => t.trim().toLowerCase()).filter(Boolean);

  await writeFile(TAGS_PATH, JSON.stringify(allTags, null, 2));
  return NextResponse.json({ success: true });
}
