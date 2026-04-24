import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GlobeAltIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import axiosPublic from "../Protected/axiosPublic";

const ServicesDirectoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRegion, setSelectedRegion] = useState("All");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosPublic.get("/api/services");
        let fetchedData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          fetchedData = response.data.data;
        } else if (Array.isArray(response.data)) {
          fetchedData = response.data;
        }
        setServices(fetchedData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Region mapping
  const regionMapping = {
    "USA": ["New York", "California", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "Schenectady", "Montauk", "Binghamton", "Ithaca", "Troy Amsterdam", "New Rochelle", "Cheektowaga", "Hempstead", "White Plains", "Niagara Falls", "Utica", "Troy", "Amsterdam", "Los Angeles", "San Francisco", "San Diego", "Chicago", "Miami", "Houston"],
    "UK": ["London", "Westminster", "Camden", "Greenwich", "Kensington", "Islington", "Lambeth", "Southwark"],
    "UAE": ["Dubai", "Downtown Dubai"],
    "Canada": ["Toronto", "Mississauga", "Brampton", "Markham"],
    "Singapore": ["Singapore", "Marina Bay"],
    "Australia": ["Sydney", "Bondi", "Manly"],
    "Others": ["General"]
  };

  const getRegionForCity = (cityName) => {
    for (const [region, cities] of Object.entries(regionMapping)) {
      if (cities.includes(cityName)) return region;
    }
    return "Others";
  };

  // Process services to extract cities and services
  const allLinks = services.map(s => {
    const isNested = s.slug && s.slug.includes('/');
    let cityName = "General";

    // City detection list (expandable)
    const knownCities = Object.values(regionMapping).flat();

    if (isNested) {
      const parts = s.slug.split('/');
      cityName = parts[0].replace(/-/g, ' ');
      // Capitalize city name
      cityName = cityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else {
      // Try to find city in title
      const title = s.pageTitle.toLowerCase();
      const foundCity = knownCities.find(c => title.includes(c.toLowerCase()));
      if (foundCity) {
        cityName = foundCity;
      }
    }

    return {
      title: s.pageTitle,
      path: `/${s.slug}`,
      city: cityName,
      region: getRegionForCity(cityName),
      isNested: isNested
    };
  });

  // Group and Sort by city
  const groupedByCity = {};
  
  // First, initialize groupedByCity with all cities from the selected region or all regions
  const regionsToShow = selectedRegion === "All" ? Object.keys(regionMapping) : [selectedRegion];
  
  regionsToShow.forEach(region => {
    if (regionMapping[region]) {
      regionMapping[region].forEach(cityName => {
        groupedByCity[cityName] = [];
      });
    }
  });

  // Then, fill with existing links
  allLinks.forEach(link => {
    // Only add link if it matches the search query and is in a region we are showing
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (matchesSearch && (selectedRegion === "All" || link.region === selectedRegion)) {
      if (!groupedByCity[link.city]) groupedByCity[link.city] = [];
      groupedByCity[link.city].push(link);
    }
  });

  // Filter out cities that have no links
  const cityEntries = Object.entries(groupedByCity)
    .filter(([cityName, links]) => links.length > 0)
    .sort((a, b) => {
      if (a[0] === "General") return 1;
      if (b[0] === "General") return -1;
      return a[0].localeCompare(b[0]);
    });

  if (loading) {
    return (
      <div className="bg-[#050508] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg animate-pulse">Fetching Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050508] min-h-screen text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden pt-24 pb-20">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-cyan-500/[0.05] rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/[0.05] rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-5 lg:px-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <GlobeAltIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-[12px] font-bold text-cyan-400 uppercase tracking-widest">Global Service Directory</span>
          </motion.div>
          <h1 className="text-4xl lg:text-7xl font-black text-white tracking-normal mb-6 italic px-4">
            Select Digital Marketing Services <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 pb-2 pr-10 inline-block">Available in Your City</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
            Browse through our extensive list of localized digital solutions. From New York to Sydney, we bring premium expertise to your doorstep.
          </p>

          {/* Region Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["All", "USA", "UK", "UAE", "Canada", "Singapore", "Australia", "Others"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 font-bold text-xs uppercase tracking-widest
                  ${selectedRegion === region
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by city or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Directory Content */}
        <div className="space-y-20">
          {cityEntries.map(([cityName, links], idx) => (
            <motion.div
              key={cityName}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <MapPinIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">{cityName}</h2>
                </div>
                <div className="flex-1 h-px bg-linear-to-r from-white/10 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.length > 0 ? (
                  links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.path}
                      className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 transition-colors"></div>
                        <span className="text-gray-300 group-hover:text-white font-medium transition-colors line-clamp-1">{link.title}</span>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full p-8 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                    <SparklesIcon className="w-8 h-8 text-gray-700 mb-3 animate-pulse" />
                    <span className="text-gray-500 font-bold tracking-widest uppercase text-xs">Services Coming Soon</span>
                    <p className="text-gray-600 text-[10px] mt-1 italic">We are currently expanding our expertise to this location.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {cityEntries.length === 0 && (
          <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
            <SparklesIcon className="w-16 h-16 text-cyan-500/20 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Services Coming Soon</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">We are currently expanding our digital expertise to this region. Stay tuned for localized updates!</p>
          </div>
        )}

        {/* Core Services Section */}
        <div className="mt-32 pt-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white italic tracking-tight">Our Core Offerings</h2>
            <p className="text-gray-500">Universal services available across all regions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Website Design", slug: "professional-website-design-services", icon: "💻" },
              { name: "Graphic Design", slug: "creative-graphic-design-services", icon: "🎨" },
              { name: "Logo Designing", slug: "logo-designing", icon: "✍️" },
              { name: "SEO Services", slug: "professional-seo-services", icon: "🔍" },
              { name: "PPC Management", slug: "ppc-management-services", icon: "💰" },
              { name: "Social Media", slug: "social-media-marketing", icon: "📲" },
              { name: "Video Advertising", slug: "video-and-youtube-advertising", icon: "🎥" },
              { name: "Local Promotion", slug: "local-business-promotion-services", icon: "📢" },
            ].map((service, idx) => (
              <Link
                key={idx}
                to={`/${service.slug}`}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</span>
                <span className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesDirectoryPage;
