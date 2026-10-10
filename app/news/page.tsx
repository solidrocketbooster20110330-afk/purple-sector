"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  pubDate?: string | null;
  thumbnail?: string;
  enclosure?: { link?: string };
  content?: string;
  description?: string;
};

function getImageUrl(item: NewsItem) {
  if (item.thumbnail) return item.thumbnail;
  if (item.enclosure?.link) return item.enclosure.link;

  const html = item.content || item.description || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || "";
}

function formatDate(value?: string | null) {
  if (!value) return "Formula1.com";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        if (!res.ok) throw new Error("News request failed");
        const data: unknown = await res.json();
        if (!cancelled) setNews(Array.isArray(data) ? (data as NewsItem[]) : []);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
        color: "white",
        padding: "20px 14px 90px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(25px, 6vw, 32px)", letterSpacing: "-0.7px" }}>
          Latest F1 News
        </h1>
        <p style={{ margin: "0 0 22px", color: "#aaa2b5", fontSize: "13px" }}>
          The latest stories from the F1 world
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {news.slice(0, 10).map((item, index) => {
            const imageUrl = getImageUrl(item);
            return (
              <a
                key={item.link || index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  minHeight: "108px",
                  overflow: "hidden",
                  borderRadius: "16px",
                  background: "#08080a",
                  border: "1px solid #292331",
                  color: "white",
                  textDecoration: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div
                  style={{
                    width: "clamp(104px, 31vw, 150px)",
                    minWidth: "clamp(104px, 31vw, 150px)",
                    minHeight: "108px",
                    background: "linear-gradient(135deg, #30213f, #141018)",
                    overflow: "hidden",
                  }}
                >
                  {imageUrl ? (
                    // RSS thumbnail supplied by the publisher.
                    <img
                      src={imageUrl}
                      alt=""
                      loading="lazy"
                      style={{ display: "block", width: "100%", height: "100%", minHeight: "108px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{ height: "100%", minHeight: "108px", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontSize: "28px", fontWeight: 900 }}
                    >
                      F1
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", justifyContent: "center", padding: "12px 13px" }}>
                  <h2 style={{ margin: 0, fontSize: "clamp(14px, 3.8vw, 17px)", lineHeight: 1.35, fontWeight: 750, overflowWrap: "anywhere" }}>
                    {item.title}
                  </h2>
                  <p style={{ margin: "10px 0 0", color: "#a9a2b2", fontSize: "12px" }}>
                    {formatDate(item.pubDate)}
                  </p>
                </div>
              </a>
            );
          })}

          {!loading && news.length === 0 && (
            <p style={{ padding: "18px 4px", color: "#b8afc4" }}>
              뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {loading && (
            <p style={{ padding: "18px 4px", color: "#b8afc4" }}>Loading news…</p>
          )}
        </div>
      </div>
    </main>
  );
}
