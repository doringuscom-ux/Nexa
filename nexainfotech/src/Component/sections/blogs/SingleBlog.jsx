import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../Protected/axiosPublic";
import BlogSidebarForm from "./BlogSidebarForm";

export default function SingleBlog() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: currentBlog } = await axios.get(`/api/blogs/slug/${slug}`);
        setBlog(currentBlog);

        // 🔥 Pretty URL Force (Canonical Redirect)
        // If the URL shows an ID or an old slug, instantly update the browser bar to the new slug
        if (currentBlog.slug && slug !== currentBlog.slug) {
          navigate(`/${currentBlog.slug}`, { replace: true });
        }

        const { data: allBlogs } = await axios.get(`/api/blogs`);
        const otherBlogs = allBlogs
          .filter(b => b.slug !== slug)
          .slice(0, 3);
        setRecentBlogs(otherBlogs);

      } catch (error) {
        console.error("Error fetching blog content:", error);
        setError(error.response?.data?.message || "Failed to load content.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug, navigate]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center text-cyan-400">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
        <div className="text-center text-red-400">
          <p className="text-2xl mb-4">❌</p>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-blue-600 rounded-full hover:scale-105 transition-transform text-white">← Go Back</button>
        </div>
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
        <div className="text-center text-gray-400">
          <p className="text-2xl mb-4">📄</p>
          <p>Blog not found</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-blue-600 rounded-full hover:scale-105 transition-transform text-white">← Go Back</button>
        </div>
      </div>
    );

  // Clean and format text content to prevent awkward breaks
  const cleanText = (html) => {
    if (!html) return '';
    // Remove zero-width spaces and fix spacing
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return (
    <>
      <style>{`
        /* Fix text wrapping and line breaks */
        .blog-rich-text {
          word-break: break-word;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.8;
        }
        
        .blog-rich-text * {
          word-break: break-word;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        
        .blog-rich-text p {
          margin-bottom: 1.5rem;
          color: #ffffff;
          font-size: 1rem;
          line-height: 1.8;
          white-space: normal;
          word-spacing: normal;
          letter-spacing: normal;
        }
        
        @media (min-width: 768px) {
          .blog-rich-text p {
            font-size: 1.1rem;
            line-height: 1.85;
          }
        }
        
        .blog-rich-text h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        
        @media(min-width:768px) {
          .blog-rich-text h2 {
            font-size: 1.875rem;
          }
        }
        
        .blog-rich-text h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #22d3ee;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .blog-rich-text ul {
          list-style-type: none;
          margin-bottom: 1.5rem;
          padding-left: 0;
        }
        
        .blog-rich-text li {
          margin-bottom: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          line-height: 1.6;
          padding-left: 1.5rem;
          position: relative;
        }
        
        .blog-rich-text li:before {
          content: "▹";
          position: absolute;
          left: 0;
          color: #22d3ee;
        }
        
        .blog-rich-text strong,
        .blog-rich-text b {
          font-weight: 800;
          color: #ffffff;
        }
        
        .blog-rich-text a {
          color: #22d3ee;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid rgba(34, 211, 238, 0.3);
          transition: all 0.2s;
        }
        
        .blog-rich-text a:hover {
          color: #00f5ff;
          border-bottom-color: #22d3ee;
        }
        
        .blog-rich-text blockquote {
          border-left: 3px solid #22d3ee;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }
        
        /* First paragraph styling - clean border instead of drop-cap */
        .blog-rich-text > p:first-of-type {
          position: relative;
          padding-left: 1rem;
          border-left: 3px solid #22d3ee;
          color: #ffffff;
          font-weight: 500;
          font-size: 1.05rem;
          margin-bottom: 1.8rem;
        }
        
        @media(min-width: 768px) {
          .blog-rich-text > p:first-of-type {
            font-size: 1.15rem;
            padding-left: 1.5rem;
          }
        }
        
        /* Animations */
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.7s ease-out forwards;
        }
        
        .animate-pulseGlow {
          animation: pulseGlow 8s ease-in-out infinite;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Responsive text sizing */
        @media (max-width: 640px) {
          .blog-rich-text p {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <section className="min-h-screen bg-[#030712] text-white relative">

        {/* ── Hero Section ── */}
        <div className="relative bg-[#030712] pt-24 md:pt-32 pb-6 md:pb-10 px-4 sm:px-6 md:px-12 overflow-hidden border-b border-white/5">
          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-64 md:w-[400px] h-64 md:h-[400px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none animate-pulseGlow" />
          <div className="absolute bottom-0 left-0 w-64 md:w-[400px] h-64 md:h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none animate-pulseGlow" style={{ animationDelay: '-4s' }} />

          <div className="container max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 relative z-10">
            {/* Text Area */}
            <div className="flex-1 text-left w-full">
              <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 text-[9px] font-bold uppercase tracking-widest mb-5 animate-fadeInLeft">
                {blog.category || "Insight"}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight animate-fadeInLeft" style={{ animationDelay: '0.15s' }}>
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-[10px] md:text-xs animate-fadeInUp uppercase tracking-widest font-bold" style={{ animationDelay: '0.3s' }}>
                <span className="text-white/80">By {blog.author || "Nexa Team"}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
                <div className="flex items-center gap-2">
                  <i className="far fa-calendar-alt text-cyan-400/60"></i>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <span className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
                <div className="flex items-center gap-2">
                  <i className="far fa-eye text-cyan-400/60"></i>
                  {(blog.views || 0).toLocaleString()} Views
                </div>
              </div>
              <div className="mt-8 flex gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-white/20 hover:scale-105 active:scale-95">
                  <i className="fas fa-chevron-left text-[8px] transition-transform group-hover:-translate-x-1"></i>
                  Back
                </button>
                <button className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-white/20">
                  <i className="fas fa-share-alt text-[10px]"></i>
                  Share
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 w-full animate-zoomIn" style={{ animationDelay: '0.2s' }}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-[32px] md:rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <img
                  src={blog.image || "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=2070&auto=format&fit=crop"}
                  alt={blog.title}
                  className="relative w-full h-[220px] sm:h-[300px] md:h-[400px] object-cover rounded-[28px] md:rounded-[40px] shadow-2xl border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x800?text=Blog+Cover'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="container max-w-7xl pt-6 mx-auto pb-12 md:pt-10 md:pb-20 px-4 sm:px-6 md:px-12">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-12 overflow-x-auto pb-2">
            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap" onClick={() => navigate('/')}>Home</span>
            <i className="fas fa-chevron-right text-[6px] opacity-30"></i>
            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap" onClick={() => navigate('/blog')}>Blog</span>
            <i className="fas fa-chevron-right text-[6px] opacity-30"></i>
            <span className="text-white/60 truncate">{blog.title}</span>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Article Section ── */}
            <div className="lg:col-span-3 min-w-0">
              <article className="blog-content">
                {blog.sections && blog.sections.length > 0 ? (
                  blog.sections.map((section, idx) => (
                    <div key={idx} className="mb-10 md:mb-14">
                      {section.type === 'text' ? (
                        <div 
                          className="blog-rich-text"
                          dangerouslySetInnerHTML={{ __html: cleanText(section.content) }}
                        />
                      ) : (
                        <div className="my-10 md:my-14 transition-all duration-500 hover:scale-[1.01]">
                          <img
                            src={section.content}
                            alt={`Blog section ${idx + 1}`}
                            className="w-full h-auto rounded-2xl md:rounded-3xl shadow-2xl border border-white/10"
                            loading="lazy"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found'; }}
                          />
                          {idx === 0 && (
                            <p className="text-white/30 text-center text-xs mt-3 italic">Visual insight from the article</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div 
                    className="blog-rich-text"
                    dangerouslySetInnerHTML={{ __html: cleanText(blog.content) }}
                  />
                )}
              </article>

              {/* ── Related Blogs Section ── */}
              {recentBlogs.length > 0 && (
                <div className="mt-20 pt-12 border-t border-white/10">
                  <div className="mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Related Articles</h2>
                    <p className="text-white/40 text-sm">Continue reading more insights from our blog</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recentBlogs.map((b, bIdx) => (
                      <div 
                        key={b._id} 
                        className="group cursor-pointer bg-white/5 rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/30"
                        style={{ animationDelay: `${0.2 + (bIdx * 0.1)}s` }}
                        onClick={() => {
                          window.scrollTo(0, 0);
                          navigate(`/${b.slug || b._id}`);
                        }}
                      >
                        <div className="relative aspect-video overflow-hidden bg-white/5">
                          <img 
                            src={b.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1470&auto=format&fit=crop"} 
                            alt={b.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-base md:text-lg font-bold text-white leading-tight mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                            {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <BlogSidebarForm />
              </div>
            </aside>
          </div>
        </div>

      </section>
    </>
  );
}