import { useState } from "react";
import axios from "../../../Protected/axiosPublic";
import { UserIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

export default function BlogSidebarForm() {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      name: "",
      email: "",
      phone: "",
      message: "",
    };
    const savedData = localStorage.getItem("nexa_lead_user_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { ...defaultData, ...parsed, message: "" };
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }
    return defaultData;
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/contact", formData);
      setSuccess(true);
      
      // Save user data for auto-fill in other forms
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Since this form doesn't have countryCode, we keep what's already in localStorage if any
        countryCode: JSON.parse(localStorage.getItem("nexa_lead_user_data") || "{}").countryCode || "+91"
      };
      localStorage.setItem("nexa_lead_user_data", JSON.stringify(userData));

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-cyan-500/10 border border-cyan-500/30 p-8 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-gray-400 text-sm">We've received your message and will get back to you shortly.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-6 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:underline"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-700"></div>
      
      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Need Help?</h3>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">Let our experts help you scale your business with custom digital solutions.</p>

      {error && <p className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            id="sidebar-name"
            name="name" 
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>
        
        <div className="relative">
          <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="email" 
            id="sidebar-email"
            name="email" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        <div className="relative">
          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="tel" 
            id="sidebar-phone"
            name="phone" 
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        <div className="relative">
          <ChatBubbleLeftEllipsisIcon className="absolute left-4 top-4 w-4 h-4 text-white/20" />
          <textarea 
            name="message" 
            placeholder="Tell us about your project..." 
            rows="4" 
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Live Support Available</div>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
