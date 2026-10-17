import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../Protected/axiosPublic"; // Using public axios to avoid session checks for SEO fetching

const SITE_URL = "https://nexainfotech.com";
const SITE_HOSTS = ["nexainfotech.com", "www.nexainfotech.com"];

// Build an absolute, normalized canonical URL (no www, no trailing slash) — Google misreads relative ones
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  let path = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (!SITE_HOSTS.includes(parsed.hostname.toLowerCase())) return url; // external canonical, keep as-is
      path = parsed.pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "");
  return path ? `${SITE_URL}${path}` : SITE_URL;
};

const setMeta = (name, content) => {
  let meta = document.querySelector(`meta[name='${name}']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const setCanonical = (href) => {
  if (!href) return;
  let link = document.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

// Old auto-created records hold placeholder text that must never reach Google
const isPlaceholderDescription = (text) =>
  !text || /Please update this in Admin Panel|^SEO description for /i.test(text);

// Fallback description: the page's first real paragraph, trimmed to ~155 chars
const descriptionFromPage = () => {
  const paragraph = [...document.querySelectorAll("main p, #root p")]
    .map((p) => p.innerText.replace(/\s+/g, " ").trim())
    .find((text) => text.length >= 80);
  if (!paragraph) return null;
  return paragraph.length > 155 ? `${paragraph.slice(0, 152).replace(/\s+\S*$/, "")}...` : paragraph;
};

const NOT_FOUND_TITLE = "Page Not Found | Nexa Infotech";

// The flag is tied to the path it was set on, so it never leaks to the next page and
// effect ordering between a page and useSEO doesn't matter.
const isNotFound = (pathname = window.location.pathname) =>
  document.documentElement.dataset.notFound === pathname;

// Call from any page that renders a "not found" state so Google drops it instead of indexing a soft 404
export const markNotFound = () => {
  document.documentElement.dataset.notFound = window.location.pathname;
  setMeta("robots", "noindex, follow");
  document.title = NOT_FOUND_TITLE;
};

const useSEO = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Skip SEO for admin and dashboard routes
    const isDashboardRoute =
      currentPath.startsWith("/admin/") ||
      currentPath === "/admin" ||
      currentPath.startsWith("/seo/") ||
      currentPath === "/seo";

    if (isDashboardRoute) {
      // FORCE noindex, nofollow for admin routes so Google officially removes them from the index
      setMeta("robots", "noindex, nofollow");
      document.title = "Dashboard | Nexa Infotech";
      return;
    }

    // Self-referencing canonical + indexable by default, before the API responds
    setCanonical(toAbsoluteUrl(currentPath));
    setMeta("robots", isNotFound(currentPath) ? "noindex, follow" : "index, follow");

    // Ignore responses/timers that belong to a page the user already left
    let cancelled = false;
    let autoSeoTimer;
    const isStale = () => cancelled || isNotFound(currentPath);

    // Wait a bit for the page to render its H1, then store it as the SEO title
    const scheduleAutoSeo = () => {
      autoSeoTimer = setTimeout(async () => {
        if (isStale()) return;
        const h1Element = document.querySelector("h1");
        const h1Text = h1Element?.innerText.trim();
        if (!h1Text) return;
        console.log("✨ Auto SEO: Syncing title from H1:", h1Text);
        try {
          await axios.post("/api/seo/auto-update", { pageUrl: currentPath, metaTitle: h1Text });
          if (!isStale()) document.title = h1Text;
        } catch (e) {
          console.error("❌ Auto SEO Error:", e);
        }
      }, 1000);
    };

    let descriptionTimer;
    const scheduleDescriptionFallback = () => {
      descriptionTimer = setTimeout(() => {
        if (isStale()) return;
        const text = descriptionFromPage();
        if (text) setMeta("description", text);
      }, 1500);
    };

    const updateSEO = async () => {
      try {
        // Encode the pathname to handle special characters in URLs correctly
        const response = await axios.get(`/api/seo/${encodeURIComponent(currentPath)}`);
        const seoData = response.data;
        if (isStale() || !seoData) return;

        console.log(`🔍 SEO Data for ${currentPath}:`, seoData);

        if (seoData.metaTitle) document.title = seoData.metaTitle;
        if (!isPlaceholderDescription(seoData.metaDescription)) {
          setMeta("description", seoData.metaDescription);
        } else {
          scheduleDescriptionFallback();
        }
        if (seoData.metaKeywords) setMeta("keywords", seoData.metaKeywords);
        setMeta("robots", seoData.robotsTag || "index, follow");

        // Fall back to the self canonical set above
        if (seoData.canonicalUrl && seoData.canonicalUrl.trim()) {
          setCanonical(toAbsoluteUrl(seoData.canonicalUrl.trim()));
        }

        // AUTO-SEO: SEO record exists but title is generic or missing
        if (!seoData.metaTitle || seoData.metaTitle === "Automatic Title") {
          scheduleAutoSeo();
        }
      } catch (error) {
        if (isStale()) return;
        if (error.response?.status === 404) {
          console.log(`ℹ️ No custom SEO found for ${currentPath}, attempting Auto SEO...`);
          scheduleAutoSeo();
          scheduleDescriptionFallback();
        } else {
          console.error("❌ SEO Update Error:", error);
        }
      }
    };

    updateSEO();

    return () => {
      cancelled = true;
      clearTimeout(autoSeoTimer);
      clearTimeout(descriptionTimer);
    };
  }, [location.pathname]);
};

export default useSEO;
