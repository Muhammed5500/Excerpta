import { NextResponse } from "next/server";
import { readPreview } from "@/lib/cache";

export async function GET() {
  const preview = await readPreview();
  if (preview) {
    return NextResponse.json(preview);
  }
  return NextResponse.json({ categories: [], lastUpdated: null, total: 0, totalSources: 0 });
}
