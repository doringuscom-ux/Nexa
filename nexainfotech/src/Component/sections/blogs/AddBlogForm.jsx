import { useState } from "react";
import axios from "../../../Protected/axios";
import { PhotoIcon, XMarkIcon, CloudArrowUpIcon, PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import RichTextEditor from "../../Common/RichTextEditor";

export default function AddBlogForm() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "Nexa Team",
    views: 0,
    category: "City Guide",
    image: "", // Featured Image
    sections: [], // [{ type: 'text', content: '' }, { type: 'image', content: '' }]
  });

  const generateSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\/-]+/g, '-')
      .replace(/\/+/g, '/')
      .replace(/^-+|-+$/g, '')
      .replace(/^\/+|\/+$/g, '');
  };

  const [loading, setLoading] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState(null); // 'featured' or index
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value)
      });
    } else if (name === "slug") {
      setFormData({
        ...formData,
        slug: generateSlug(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // ========== IMAGE UPLOAD HANDLER ==========
  const handleImageUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingTarget(target);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await axios.post('/api/blogs/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const url = response.data.data.url;
        if (target === 'featured') {
          setFormData({ ...formData, image: url });
        } else {
          const newSections = [...formData.sections];
          newSections[target].content = url;
          setFormData({ ...formData, sections: newSections });
        }
      }
    } catch (err) {
      setError("❌ Image upload failed");
    } finally {
      setUploadingTarget(null);
    }
  };


  // ========== SECTION MANAGEMENT ==========
  const addTextSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { type: 'text', content: '' }]
    });
  };

  const addImageSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { type: 'image', content: '' }]
    });
  };

  const removeSection = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const updateSectionContent = (index, value) => {
    const newSections = [...formData.sections];
    newSections[index].content = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      setError("Title and Featured Image are required");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/blogs", formData);
      setSuccess("Blog Published Successfully 🚀");
      setFormData({
        title: "",
        author: "Nexa Team",
        views: 0,
        category: "City Guide",
        image: "",
        sections: [],
      });
    } catch (err) {
      setError("Failed to publish blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 py-28 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#111122]/50 border border-white/5 rounded-[40px] shadow-2xl p-8 md:p-12 backdrop-blur-2xl">
        <h2 className="text-4xl font-extrabold text-white mb-10 text-center tracking-tight">Create Dynamic Blog</h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3"><XMarkIcon className="w-5 h-5"/>{error}</div>}
        {success && <div className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 p-4 rounded-2xl mb-8 flex items-center gap-3"><span>✅</span>{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-white/60 text-[10px] font-bold ml-2 uppercase tracking-widest">Blog Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="The future of tech..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:border-cyan-400 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-[10px] font-bold ml-2 uppercase tracking-widest text-cyan-400/60">Custom URL Slug (Auto-generated)</label>
              <div className="relative">
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="the-future-of-tech" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-mono text-sm focus:border-cyan-400 focus:outline-none transition-all" />
                <p className="mt-2 text-[10px] text-white/20 font-medium ml-2">
                  Preview: <span className="text-cyan-400/50">nexainfotech.com/</span><span className="text-cyan-400">{formData.slug || '...'}</span>
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-[10px] font-bold ml-2 uppercase tracking-widest text-cyan-400/60">Author Name</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:border-cyan-400 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium ml-2 uppercase tracking-widest">Initial Views</label>
              <input type="number" name="views" value={formData.views} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium ml-2 uppercase tracking-widest">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="City Guide" className="bg-[#030712]">City Guide</option>
                <option value="Business" className="bg-[#030712]">Business</option>
                <option value="Strategy" className="bg-[#030712]">Strategy</option>
                <option value="Events" className="bg-[#030712]">Events</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-white/60 text-sm font-medium ml-2 uppercase tracking-widest">Featured Header Image</label>
             {formData.image ? (
                <div className="relative group overflow-hidden rounded-3xl border-2 border-cyan-400/30 w-full h-[250px]">
                  <img src={formData.image} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({...formData, image: ""})} className="absolute top-4 right-4 bg-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><XMarkIcon className="w-5 h-5"/></button>
                </div>
             ) : (
                <label className="flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed border-white/10 rounded-3xl bg-white/2 hover:bg-white/5 transition-all cursor-pointer group">
                   <CloudArrowUpIcon className="w-12 h-12 text-white/20 group-hover:text-cyan-400 transition-colors" />
                   <span className="mt-4 text-white/40 group-hover:text-white transition-colors">{uploadingTarget === 'featured' ? 'Uploading...' : 'Upload Featured Image'}</span>
                   <input type="file" onChange={(e) => handleImageUpload(e, 'featured')} className="hidden" />
                </label>
             )}
          </div>

          {/* Dynamic Sections Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h3 className="text-2xl font-bold text-white">Content Builder</h3>
               <div className="flex gap-4">
                  <button type="button" onClick={addTextSection} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-all border border-white/10"><PlusIcon className="w-4 h-4"/> Add Text</button>
                  <button type="button" onClick={addImageSection} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-all border border-white/10"><PhotoIcon className="w-4 h-4"/> Add Image</button>
               </div>
            </div>

            {formData.sections.map((section, idx) => (
              <div key={idx} className="relative group bg-white/2 rounded-3xl border border-white/5 p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[10px] tracking-widest">
                        {section.type === 'text' ? <DocumentTextIcon className="w-4 h-4"/> : <PhotoIcon className="w-4 h-4"/>}
                        Section #{idx + 1}
                      </div>
                   </div>
                   <button type="button" onClick={() => removeSection(idx)} className="text-gray-500 hover:text-red-400 transition-colors bg-red-400/5 p-2 rounded-xl border border-red-500/10"><TrashIcon className="w-5 h-5"/></button>
                </div>

                {section.type === 'text' ? (
                  <RichTextEditor 
                    value={section.content} 
                    onChange={(value) => updateSectionContent(idx, value)} 
                    placeholder="Write your story here..." 
                  />
                ) : (
                  <div className="space-y-4">
                    {section.content ? (
                      <div className="relative rounded-2xl overflow-hidden h-[200px] border border-white/10">
                        <img src={section.content} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => updateSectionContent(idx, "")} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"><XMarkIcon className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-[150px] border-2 border-dashed border-white/5 rounded-2xl bg-white/2 hover:bg-white/5 cursor-pointer group">
                        <CloudArrowUpIcon className="w-10 h-10 text-white/10 group-hover:text-cyan-400 transition-colors" />
                        <span className="mt-3 text-white/30">{uploadingTarget === idx ? 'Uploading...' : 'Upload Section Image'}</span>
                        <input type="file" onChange={(e) => handleImageUpload(e, idx)} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 bg-size-[200%] hover:bg-right font-bold text-white h-16 rounded-[40px] text-xl transition-all hover:-translate-y-1 shadow-xl shadow-cyan-400/20 disabled:opacity-50"
          >
            {loading ? 'Publishing Everything...' : '🚀 Publish Complete Blog'}
          </button>
        </form>
      </div>
    </div>
  );
}
