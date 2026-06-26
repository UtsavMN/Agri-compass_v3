import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/store";
import { DISTRICTS } from "@/data/masterData";
import { apiPut } from "@/lib/httpClient";

export function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    usernameHandle: profile?.username || "",
    phone: profile?.phone || "",
    district: profile?.district || "Bengaluru Urban",
    bio: profile?.bio || "",
    languagePreference: profile?.language || "en",
    avatarUrl: profile?.avatar_url || profile?.profile_picture_url || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updated = await apiPut('/api/profiles', formData);
      updateProfile(updated);
      onClose();
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-[0_0_40px_rgba(201,168,76,0.1)] my-8 relative"
      >
        <h2 className="text-2xl font-serif text-[#F5F0E8] mb-6">Edit Profile</h2>
        
        <div className="space-y-4">
          {/* Avatar Upload (Mock for now, should integrate Cloudinary) */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-[#1a1a0e] border border-[#C9A84C]/30 flex items-center justify-center overflow-hidden">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#C9A84C] font-bold text-xl">{formData.fullName.charAt(0)}</span>
              )}
            </div>
            <button className="px-4 py-2 border border-[#1E1E1E] text-xs font-bold uppercase tracking-wider text-[#F5F0E8]/70 hover:text-[#C9A84C] rounded-lg transition-colors">
              Change Photo
            </button>
          </div>

          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">Username Handle</label>
            <input
              name="usernameHandle"
              value={formData.usernameHandle}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none appearance-none"
            >
              {Object.keys(DISTRICTS).sort().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">Language</label>
            <select
              name="languagePreference"
              value={formData.languagePreference}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none appearance-none"
            >
              <option value="en">English</option>
              <option value="kn">Kannada</option>
            </select>
          </div>
          <div>
            <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-1 block">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={150}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:outline-none min-h-[80px]"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-[#1E1E1E] text-[#F5F0E8]/60 font-semibold rounded-xl hover:bg-[#1E1E1E] transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-[#C9A84C] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#D4B86A] transition-all">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
