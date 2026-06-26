import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GoldCard } from "@/components/ui/GoldCard";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";
import { useUser } from "@/store";
import { apiGet } from "@/lib/httpClient";
import { FarmIntelligenceCard } from "@/components/FarmIntelligenceCard";
import { MoreVertical, Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useClerk } from "@clerk/clerk-react";

type Tab = "posts" | "farms" | "schemes";

export default function Profile() {
  const { user: authUser, profile, signOut } = useUser();
  const { openUserProfile } = useClerk();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [editOpen, setEditOpen] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    if (authUser?.id) {
      loadUserPosts();
      loadUserFarms();
    }
  }, [authUser?.id]);

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
      <div className="w-full relative animate-fade-in text-center py-24 text-white">
        Please authenticate.
      </div>
    );
  }

  const userStats = {
    totalAcres: farms.reduce((sum, f) => sum + (f.areaAcres || 0), 0),
    cropsGrowing: farms.filter(f => f.cropFocus).length,
    totalPosts: posts.length,
    reputation: "N/A", // Priority 2: Fix hardcoded reputation
  };

  const avatarUrl = profile.avatar_url || profile.profile_picture_url;
  const initial = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="w-full relative animate-fade-in min-h-screen bg-[#0A0A0A] pb-24">
      
      {/* COVER PHOTO (Gradient Fallback) */}
      <div className="relative h-48 md:h-56 w-full bg-gradient-to-br from-[#1a1a0e] to-[#0A0A0A] overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        {profile.cover_photo_url && (
          <img src={profile.cover_photo_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* PROFILE HEADER - Avatar + Info + Three Dot Menu */}
        <div className="relative flex justify-between items-start -mt-12 md:-mt-16 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            {/* AVATAR */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0A0A0A] bg-[#1a1a0e] flex items-center justify-center overflow-hidden z-10 shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-4xl font-serif">
                  {initial}
                </div>
              )}
            </div>
            
            {/* INFO */}
            <div className="mt-2 md:mt-0 md:pb-2">
              <h1 className="text-2xl md:text-3xl font-serif text-[#F5F0E8] leading-tight">
                {profile.full_name || 'Anonymous Farmer'}
              </h1>
              <p className="text-[#C9A84C] text-sm md:text-base font-medium">@{profile.username}</p>
              <p className="text-[#F5F0E8]/40 text-xs md:text-sm mt-1.5 flex items-center gap-1.5">
                📍 {profile.district || profile.location || 'Unknown District'} · Farmer since {profile.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
              </p>
              {profile.bio && (
                <p className="text-[#F5F0E8]/70 text-sm mt-3 max-w-md line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* THREE DOT MENU (Top Right) */}
          <div className="pt-14 md:pt-16">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-[#F5F0E8]/70 hover:text-[#C9A84C] rounded-full hover:bg-[#1E1E1E] transition-all outline-none">
                  <MoreVertical className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-[#1E1E1E] shadow-xl rounded-xl p-1">
                <DropdownMenuItem onClick={() => setEditOpen(true)} className="text-[#F5F0E8] hover:bg-[#1E1E1E] cursor-pointer rounded-lg py-2.5 px-3">
                  <Settings className="w-4 h-4 mr-3 text-[#C9A84C]" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => openUserProfile()} 
                  className="text-[#F5F0E8] hover:bg-[#1E1E1E] cursor-pointer rounded-lg py-2.5 px-3"
                >
                  <User className="w-4 h-4 mr-3 text-[#F5F0E8]/50" />
                  Account Settings (Clerk)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }} 
                  className="text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg py-2.5 px-3 mt-1"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* STATS ROW */}
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Acres", value: userStats.totalAcres, suffix: " ac" },
              { label: "Active Crops", value: userStats.cropsGrowing },
              { label: "Posts", value: userStats.totalPosts },
              { label: "Reputation", value: userStats.reputation, suffix: "" },
            ].map((stat, i) => (
              <GoldCard key={i} className="text-center py-4 px-2">
                <p className="text-2xl font-bold text-[#C9A84C]">{stat.value}{stat.suffix}</p>
                <p className="text-[#F5F0E8]/40 text-[10px] md:text-xs mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
              </GoldCard>
            ))}
          </div>
        </AnimatedSection>

        {/* TABS */}
        <div className="flex gap-4 border-b border-[#1E1E1E] mb-6 overflow-x-auto hide-scrollbar">
          {(["posts", "farms", "schemes"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative px-1 ${
                activeTab === tab ? "text-[#C9A84C]" : "text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70"
              }`}
            >
              {tab === "farms" ? "My Farms" : tab === "schemes" ? "Saved Schemes" : "Posts"}
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab-indicator"
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
            transition={{ duration: 0.2 }}
          >
            {activeTab === "posts" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posts.length > 0 ? posts.map((post, i) => (
                  <motion.div key={i} variants={fadeUpVariants} custom={i} onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer">
                    <GoldCard className="h-full hover:-translate-y-1 transition-transform">
                      <span className="text-[#C9A84C] text-[10px] font-black uppercase tracking-wider">{post.category || 'General'}</span>
                      <p className="text-[#F5F0E8]/90 text-sm mt-2 italic line-clamp-3">"{post.content}"</p>
                      <div className="flex gap-4 mt-4 pt-4 border-t border-[#1E1E1E] text-[10px] text-[#F5F0E8]/40 font-semibold uppercase tracking-wider">
                        <span>{post.likes_count || 0} likes</span>
                        <span>{post.comments_count || 0} comments</span>
                      </div>
                    </GoldCard>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center py-16 text-[#F5F0E8]/40 border border-[#1E1E1E] border-dashed rounded-2xl">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No posts shared yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "farms" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="col-span-full text-center py-16 text-[#F5F0E8]/40 border border-[#1E1E1E] border-dashed rounded-2xl">
                    <Sprout className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No farms added yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "schemes" && (
              <div className="col-span-full text-center py-16 text-[#F5F0E8]/40 border border-[#1E1E1E] border-dashed rounded-2xl">
                <p>Saved schemes will appear here.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
