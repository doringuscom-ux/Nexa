import axios from "../../../Protected/axiosPublic";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [visibleCount, setVisibleCount] = useState(6);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get("/api/blogs");
        // Sort blogs by newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBlogs(sorted);
        setFilteredBlogs(sorted);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(error.response?.data?.message || "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtering logic (Category + Search)
  useEffect(() => {
    let filtered = blogs;
    if (activeCategory !== "All") {
      filtered = filtered.filter(b => b.category === activeCategory);
    }
    setFilteredBlogs(filtered);
  }, [activeCategory, blogs]);

  const categories = ["All", ...new Set(blogs.map(b => b.category || "General"))];

  const featuredBlog = blogs[0];
  const displayedBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <section ref={sectionRef} className="relative pt-24 pb-28 bg-[#000000] text-white overflow-hidden min-h-screen font-nunito selection:bg-purple-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Montserrat:wght@500;800;900&display=swap');
        .font-nunito { font-family: 'Nunito', sans-serif !important; }
        .font-montserrat { font-family: 'Montserrat', sans-serif !important; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .sos-hero-bg { background: radial-gradient(circle at 50% 30%, rgba(65, 14, 200, 0.4) 0%, transparent 50%), #000; }
        .card-hover-img { transition: transform 0.6s cubic-bezier(0.33, 1, 0.68, 1); }
        .group:hover .card-hover-img { transform: scale(1.1) rotate(-3deg); }
      `}</style>

      {/* Background Glows (Nexa Style) */}
      <div className="absolute inset-0 sos-hero-bg pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10 font-nunito">
        
        {/* ── Page Header ── */}
        <div className="text-center mb-10 md:mb-16 pt-0 sm:pt-4 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white mb-3 tracking-tight font-montserrat leading-[1.2]">
             NEXA INFOTECH <span className="text-white/60">BLOG</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg md:text-xl font-normal mb-6 font-nunito leading-relaxed px-4">
             Find popular trends in corporate team-building and <br className="hidden md:block" /> offsites here at Nexa Infotech.
          </p>
        </div>

        {/* ── Featured Hero Section (Exact 550px) ── */}
        {loading ? (
             <div className="h-[550px] w-full bg-white/5 rounded-[30px] animate-pulse mb-20 flex items-center justify-center border border-white/5">
                 <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             </div>
        ) : featuredBlog && activeCategory === "All" && (
          <div 
            className="group cursor-pointer transition-all duration-700 animate-fadeInUp mb-16 md:mb-24 flex flex-col gap-6"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/${featuredBlog.slug || featuredBlog._id}`);
            }}
          >
            {/* Image Container */}
            <div className="relative h-[380px] sm:h-[450px] md:h-[550px] w-full overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              {/* background image */}
              <img 
                  src={featuredBlog.image || "https://via.placeholder.com/1200x600"} 
                  alt={featuredBlog.title}
                  className="absolute inset-0 w-full h-full object-contain bg-[#0a0a0a] transition-transform duration-[2s] group-hover:scale-105"
              />
              
              {/* circle icon */}
              <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center bg-black/20 group-hover:bg-white group-hover:text-black transition-all duration-500 group-hover:scale-110">
                <ArrowUpRightIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transform group-hover:rotate-0 transition-transform duration-500" />
              </div>
            </div>

            {/* Title / Info Below Image */}
            <div className="px-2 sm:px-4">
              <span className="text-[#a0a0a0] text-sm sm:text-lg font-medium mb-2 block">
                {featuredBlog.category || "General"} • {new Date(featuredBlog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                {featuredBlog.title}
              </h2>
            </div>
          </div>
        )}

        {/* ── Filter Section (SOS Style Pills) ── */}
        <div className="mb-20 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {categories.map((cat) => (
                  <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-8 py-3 rounded-full text-[13.6px] font-normal tracking-tight transition-all duration-300 border ${
                          activeCategory === cat 
                          ? "bg-black text-white border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                          : "bg-[#2F3032] text-white border-[#2F3032] hover:bg-black hover:text-white hover:border-white/30"
                      }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
        </div>

        {/* ── Blogs Grid (2-Column Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {!loading && displayedBlogs.map((blog, index) => (
            <div 
              key={blog._id} 
              className="group cursor-pointer transition-all duration-700 animate-fadeInUp flex flex-col gap-4"
              style={{ animationDelay: `${0.1 * (index % 6)}s` }}
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(`/${blog.slug || blog._id}`);
              }}
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] sm:rounded-[48px]">
                {/* background image */}
                <img 
                    src={blog.image || "https://via.placeholder.com/800x800"} 
                    alt={blog.title}
                    className="absolute inset-0 w-full h-full object-contain bg-[#0a0a0a] transition-transform duration-[1.5s] group-hover:scale-110"
                />
                
                {/* circle icon */}
                <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 flex items-center justify-center bg-[#030712] group-hover:bg-white group-hover:text-black transition-all duration-500 group-hover:scale-110">
                  <ArrowUpRightIcon className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>

              {/* Title / Info Below Image */}
              <div className="px-2">
                <span className="text-[#a0a0a0] text-xs sm:text-sm font-medium mb-1 block">
                  {blog.category || "General"} • {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                  {blog.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button (SOS Style) */}
        {!loading && filteredBlogs.length > visibleCount && (
          <div className="text-center mt-24">
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="px-14 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[4px] hover:bg-black hover:text-white transition-all shadow-2xl border border-white hover:border-white/30"
            >
              Learn More
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
            <div className="text-center py-40 border-t border-white/5">
                <i className="fas fa-folder-open text-white/10 text-3xl mb-6"></i>
                <p className="text-white/20 font-black uppercase tracking-[6px] text-[8px]">No insights found matching your criteria.</p>
            </div>
        )}
      </div>
    </section>
  );
}
