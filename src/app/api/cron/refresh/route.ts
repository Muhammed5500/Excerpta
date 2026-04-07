import { NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes (Vercel Pro)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Trigger full refresh by calling the articles endpoint internally
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/articles?refresh=true`);
    const data = await res.json();

    return NextResponse.json({
      success: true,
      articlesCount: data.articles?.length || 0,
      sourceStats: data.sourceStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
