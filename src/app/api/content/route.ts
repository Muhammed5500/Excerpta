import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Excerpta/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch", status: res.status }, { status: 502 });
    }

    const html = await res.text();

    // Extract article content heuristically
    const content = extractArticleContent(html);
    const title = extractTitle(html);

    return NextResponse.json({ title, content, sourceUrl: url });
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 502 });
  }
}

function extractTitle(html: string): string {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*?)"/)?.[1];
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  return ogTitle || titleTag?.trim() || "";
}

function extractArticleContent(html: string): string {
  // Try to find article/main content
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class="[^"]*(?:post-content|article-content|entry-content|content-body|blog-post|prose)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*(?:post|article|entry|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let rawHtml = "";
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].length > 200) {
      rawHtml = match[1];
      break;
    }
  }

  if (!rawHtml) {
    // Fallback: try body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    rawHtml = bodyMatch?.[1] || html;
  }

  // Clean HTML: keep structural tags, remove scripts/styles/nav
  rawHtml = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Convert to simplified HTML (keep p, h1-h6, ul, ol, li, a, img, blockquote, pre, code, em, strong, br)
  // Remove all other tags but keep content
  rawHtml = rawHtml
    .replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|a|img|blockquote|pre|code|em|strong|br|hr|figure|figcaption|table|thead|tbody|tr|td|th|sup|sub)\b)[^>]*>/gi, "");

  // Clean up whitespace
  rawHtml = rawHtml
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return rawHtml;
}
