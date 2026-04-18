import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../Protected/axiosPublic";
import { XMarkIcon } from "@heroicons/react/24/outline";

const countryCodes = [
  { code: "+1", iso: "US", name: "United States" },
  { code: "+1", iso: "CA", name: "Canada" },
  { code: "+44", iso: "GB", name: "United Kingdom" },
  { code: "+91", iso: "IN", name: "India" },
  { code: "+61", iso: "AU", name: "Australia" },
  { code: "+49", iso: "DE", name: "Germany" },
  { code: "+33", iso: "FR", name: "France" },
  { code: "+81", iso: "JP", name: "Japan" },
  { code: "+86", iso: "CN", name: "China" },
  { code: "+971", iso: "AE", name: "United Arab Emirates" },
  { code: "+7", iso: "RU", name: "Russia" },
  { code: "+55", iso: "BR", name: "Brazil" },
  { code: "+52", iso: "MX", name: "Mexico" },
  { code: "+39", iso: "IT", name: "Italy" },
  { code: "+34", iso: "ES", name: "Spain" },
  { code: "+31", iso: "NL", name: "Netherlands" },
  { code: "+41", iso: "CH", name: "Switzerland" },
  { code: "+46", iso: "SE", name: "Sweden" },
  { code: "+47", iso: "NO", name: "Norway" },
  { code: "+65", iso: "SG", name: "Singapore" },
  { code: "+82", iso: "KR", name: "South Korea" },
  { code: "+27", iso: "ZA", name: "South Africa" },
  { code: "+966", iso: "SA", name: "Saudi Arabia" },
  { code: "+90", iso: "TR", name: "Turkey" },
  { code: "+48", iso: "PL", name: "Poland" },
  { code: "+351", iso: "PT", name: "Portugal" },
  { code: "+353", iso: "IE", name: "Ireland" },
  { code: "+64", iso: "NZ", name: "New Zealand" },
  { code: "+60", iso: "MY", name: "Malaysia" },
  { code: "+66", iso: "TH", name: "Thailand" },
  { code: "+62", iso: "ID", name: "Indonesia" },
  { code: "+94", iso: "LK", name: "Sri Lanka" },
  { code: "+92", iso: "PK", name: "Pakistan" },
  { code: "+880", iso: "BD", name: "Bangladesh" },
  { code: "+234", iso: "NG", name: "Nigeria" },
  { code: "+254", iso: "KE", name: "Kenya" },
  { code: "+20", iso: "EG", name: "Egypt" },
  { code: "+212", iso: "MA", name: "Morocco" },
  { code: "+30", iso: "GR", name: "Greece" },
  { code: "+420", iso: "CZ", name: "Czech Republic" },
  { code: "+43", iso: "AT", name: "Austria" },
  { code: "+32", iso: "BE", name: "Belgium" },
  { code: "+45", iso: "DK", name: "Denmark" },
  { code: "+358", iso: "FI", name: "Finland" },
  { code: "+36", iso: "HU", name: "Hungary" },
  { code: "+972", iso: "IL", name: "Israel" },
  { code: "+54", iso: "AR", name: "Argentina" },
  { code: "+56", iso: "CL", name: "Chile" },
  { code: "+57", iso: "CO", name: "Colombia" },
  { code: "+51", iso: "PE", name: "Peru" },
  { code: "+63", iso: "PH", name: "Philippines" },
  { code: "+84", iso: "VN", name: "Vietnam" },
];

export default function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    countryCode: "+91",
  });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Show on every refresh with a 2-second delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountrySelect = (code) => {
    setFormData({ ...formData, countryCode: code });
    setIsDropdownOpen(false);
  };

  // Common submission logic
  const performSubmission = async (isSilent = false) => {
    // Don't submit if already submitted or no data entered
    if (hasSubmitted) return;
    
    // Allow submission even if empty fields exist

    try {
      if (!isSilent) setLoading(true);
      
      const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || {};
      const submissionData = {
        ...formData,
        countryName: selectedCountry.name || "India",
        phone: formData.phone.trim() ? `${formData.countryCode} ${formData.phone}` : "",
        source: 'popup'
      };

      await axios.post("/api/contact", submissionData);
      setHasSubmitted(true);
      localStorage.setItem("popupSubmitted", "true");

      if (!isSilent) {
        alert("Inquiry Sent Successfully! We will contact you soon. 🚀");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Popup submission error:", error);
      if (!isSilent) {
        alert(error.response?.data?.message || "Failed to send inquiry ❌");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSubmission(false);
  };

  const handleClose = () => {
    // If user typed something but didn't click submit, send it in background
    if (!hasSubmitted) {
      performSubmission(true);
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500" />
            
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">Quick Inquiry</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Let's Grow Together</h2>
                <p className="text-gray-400">Fill out the form below and our experts will get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name (Optional)"
                    className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all"
                  />
                </div>

                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address (Optional)"
                    className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-stretch bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-cyan-400/50 focus-within:bg-cyan-400/5 transition-all">
                    <div 
                      className="flex items-center gap-2 px-4 cursor-pointer hover:bg-white/5 transition-colors border-r border-white/10"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="text-white text-sm font-semibold">{formData.countryCode}</span>
                      <svg className={`w-3 h-3 text-white/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number (Optional)"
                      className="flex-1 py-4 px-4 bg-transparent text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full max-h-60 bg-[#0c1425] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-white/5">
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {countryCodes
                          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery))
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-3 hover:bg-cyan-500/10 cursor-pointer text-sm text-white flex justify-between"
                              onClick={() => handleCountrySelect(item.code)}
                            >
                              <span>{item.name}</span>
                              <span className="text-cyan-400">{item.code}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you? (Optional)"
                    className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-4"
                >
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
