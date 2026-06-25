import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GoldCard } from "@/components/ui/GoldCard";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";
import { useUser } from "@/store";
import { apiGet } from "@/lib/httpClient";
import { FarmIntelligenceCard } from "@/components/FarmIntelligenceCard";
import { Menu, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

type Tab = "posts" | "farms" | "schemes";

const COVER_IMAGES = [
  '/karnataka_farmland_hero.png',
  '/hero_image_4.jpg',
  '/hero_image_3.jpg',
  '/hero_image_2.jpg'
];

export default function Profile() {
  const { user: authUser, profile, updateProfile, signOut } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);

  const [posts, setPosts] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    if (authUser?.id) {
      loadUserPosts();
      loadUserFarms();
    }
  }, [authUser?.id]);

  useEffect(() => {
    // Calculate initial index based on current 15-minute window
    const updateCover = () => {
      const now = new Date();
      // Change every 15 minutes
      const windowIndex = Math.floor((now.getHours() * 60 + now.getMinutes()) / 15);
      setCoverIndex(windowIndex % COVER_IMAGES.length);
    };
    
    updateCover();
    // Re-check every minute to see if we crossed a 15-minute boundary
    const interval = setInterval(updateCover, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUserFarms = async () => {
    try {
      const data = await apiGet(`/api/farms`);
      setFarms(data || []);
    } catch (error) {
      console.error("Failed to load farms", error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const data = await apiGet(`/api/posts?userId=${authUser?.id}&page=1&limit=10`);
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to load posts", error);
    }
  };

  if (!authUser || !profile) {
    return (
      <div className="w-full relative animate-fade-in">
        <div className="text-center py-24 text-white">Please authenticate.</div>
      </div>
    );
  }

  const userStats = {
    totalAcres: farms.reduce((sum, f) => sum + (f.areaAcres || 0), 0),
    cropsGrowing: farms.filter(f => f.cropFocus).length,
    totalPosts: posts.length,
    reputation: (profile as any).reputation || 92,
  };

  return (
    <div className="w-full relative animate-fade-in">
      <div className="min-h-screen bg-[#0A0A0A]">

        {/* COVER + AVATAR */}
        <div className="relative h-56 bg-gradient-to-r from-[#1a1a0e] to-[#0A0A0A] overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={coverIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
              style={{ backgroundImage: `url('${COVER_IMAGES[coverIndex]}')` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]/80" />
        </div>

        <div className="max-w-4xl mx-auto px-6">

          {/* PROFILE HEADER */}
          <div className="relative -mt-16 mb-6 flex items-end justify-between">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 rounded-full border-4 border-[#C9A84C] bg-[#1E1E1E] flex items-center justify-center text-4xl shadow-xl">
                🌾
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-serif text-[#F5F0E8]">{profile.full_name || 'Anonymous Farmer'}</h1>
                <p className="text-[#C9A84C] text-sm">@{profile.username || authUser.id}</p>
                <p className="text-[#F5F0E8]/40 text-xs mt-1 flex items-center gap-1.5">
                  📍 {profile.location || 'Karnataka'} · Farmer since 2024
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-2">
              <button
                onClick={() => setEditOpen(true)}
                className="px-5 py-2 border border-[#C9A84C]/40 text-[#C9A84C] text-sm rounded-lg hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
              >
                Edit Profile
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 border border-[#1E1E1E] text-[#F5F0E8]/70 hover:text-[#C9A84C] rounded-lg hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all">
                    <Menu className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#1E1E1E]">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="text-[#F5F0E8] hover:bg-[#1E1E1E] cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }} 
                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* STATS ROW */}
          <AnimatedSection>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total Acres", value: userStats.totalAcres, suffix: " ac" },
                { label: "Active Crops", value: userStats.cropsGrowing },
                { label: "Posts", value: userStats.totalPosts },
                { label: "Reputation", value: userStats.reputation, suffix: "%" },
              ].map((stat, i) => (
                <GoldCard key={i} className="text-center py-4">
                  <p className="text-2xl font-bold text-[#C9A84C]">{stat.value}{stat.suffix || ""}</p>
                  <p className="text-[#F5F0E8]/40 text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
                </GoldCard>
              ))}
            </div>
          </AnimatedSection>

          {/* TABS */}
          <div className="flex gap-1 border-b border-[#1E1E1E] mb-6">
            {(["posts", "farms", "schemes"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab ? "text-[#C9A84C]" : "text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70"
                }`}
              >
                {tab === "farms" ? "My Farms" : tab === "schemes" ? "Saved Schemes" : "Posts"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A84C]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "posts" && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-10">
                  {posts.length > 0 ? posts.map((post, i) => (
                    <motion.div key={i} variants={fadeUpVariants} custom={i} onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer">
                      <GoldCard className="h-full">
                        <span className="text-[#C9A84C] text-[10px] font-black uppercase tracking-wider">{post.category || 'General'}</span>
                        <p className="text-[#F5F0E8]/90 text-sm mt-2 italic line-clamp-3">"{post.content}"</p>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-[#1E1E1E] text-xs text-[#F5F0E8]/40 font-semibold uppercase tracking-wider">
                          <span>{post.likes_count} likes</span>
                          <span>{post.comments_count} comments</span>
                        </div>
                      </GoldCard>
                    </motion.div>
                  )) : (
                    <div className="col-span-3 text-center py-12 text-[#F5F0E8]/40">No posts shared yet.</div>
                  )}
                </motion.div>
              )}

              {activeTab === "farms" && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 pb-12">
                  {farms.length > 0 ? farms.map((farm, i) => (
                    <motion.div key={i} variants={fadeUpVariants} custom={i}>
                      <FarmIntelligenceCard
                        farmName={farm.name}
                        acres={farm.areaAcres}
                        district={farm.location}
                        crop={farm.cropFocus}
                      />
                    </motion.div>
                  )) : (
                    <div className="text-center py-12 text-[#F5F0E8]/40">No farms added yet.</div>
                  )}
                </motion.div>
              )}

              {activeTab === "schemes" && (
                <div className="text-center py-12 text-[#F5F0E8]/40">Saved schemes will appear here.</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* EDIT PROFILE MODAL */}
        <AnimatePresence>
          {editOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEditOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-8 w-full max-w-lg shadow-[0_0_40px_rgba(201,168,76,0.1)]"
              >
                <h2 className="text-2xl font-serif text-[#F5F0E8] mb-6">Edit Profile</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-2 block">Full Name</label>
                    <input
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3.5 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 focus:outline-none transition-all"
                      defaultValue={profile.full_name}
                    />
                  </div>
                  <div>
                    <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-2 block">Username Handle</label>
                    <input
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3.5 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 focus:outline-none transition-all"
                      defaultValue={profile.username}
                    />
                  </div>
                  <div>
                    <label className="text-[#F5F0E8]/40 text-xs uppercase font-bold tracking-wider mb-2 block">District</label>
                    <select className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3.5 text-[#F5F0E8] focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 focus:outline-none appearance-none">
                      <option value="Bengaluru Urban">Bengaluru Urban</option>
                      <option value="Bagalkot">Bagalkot</option>
                      <option value="Mysore">Mysore</option>
                      <option value="Dharwad">Dharwad</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setEditOpen(false)} className="flex-1 py-3.5 border border-[#1E1E1E] text-[#F5F0E8]/60 font-semibold rounded-xl hover:border-[#C9A84C]/30 hover:bg-[#1E1E1E] transition-all">Cancel</button>
                  <button onClick={() => setEditOpen(false)} className="flex-1 py-3.5 bg-[#C9A84C] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#D4B86A] transition-all">Save Changes</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
