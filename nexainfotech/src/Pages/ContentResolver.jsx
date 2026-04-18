import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SingleBlogPage from "./SingleBlogPage";
import ServiceDetails from "./ServiceDetails";
import axios from "../Protected/axiosPublic";

export default function ContentResolver() {
  const params = useParams();
  const location = useLocation();
  const [contentType, setContentType] = useState("loading"); // "blog", "service", "loading", "error"

  useEffect(() => {
    const resolveContent = async () => {
      const { slug, city, serviceName } = params;

      // 1. If it's a nested service path, it's definitely a service
      if (city && serviceName) {
        setContentType("service");
        return;
      }

      // 2. If path starts with /blog/, it's likely a blog (though App.jsx routes it here)
      if (location.pathname.startsWith("/blog/")) {
        setContentType("blog");
        return;
      }

      // 3. Root level slug: /:slug
      // We need to check if this slug belongs to a blog or a service
      try {
        setContentType("loading");
        
        // Try to find if it's a blog first (smaller dataset usually)
        const blogRes = await axios.get(`/api/blogs/slug/${slug}`);
        if (blogRes.data) {
          setContentType("blog");
          return;
        }
      } catch (err) {
        // If blog not found, try service
        try {
          const serviceRes = await axios.get(`/api/services/slug/${encodeURIComponent(slug)}`);
          if (serviceRes.data.success) {
            setContentType("service");
            return;
          }
        } catch (err2) {
          console.error("Content resolution failed:", err2);
          setContentType("error");
        }
      }
    };

    resolveContent();
  }, [params, location.pathname]);

  if (contentType === "loading") {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (contentType === "blog") {
    return <SingleBlogPage />;
  }

  if (contentType === "service") {
    return <ServiceDetails />;
  }

  // Fallback to ServiceDetails which has its own 404 handling, or a generic 404
  return <ServiceDetails />;
}
