import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GoldCard } from "@/components/ui/GoldCard";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";
import { apiGet, apiPost, apiDelete } from "@/lib/httpClient";
import { FarmIntelligenceCard } from "@/components/FarmIntelligenceCard";
import { MessageSquare, Sprout, MapPin } from "lucide-react";

interface UserProfile {
  clerkUserId: string;
  fullName: string;
  usernameHandle: string;
  district: string;
  profilePictureUrl?: string;
  bio?: string;
  createdAt?: string;
}

type Tab = "posts" | "farms";

export const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile');
      return;
    }
    
    if (!userId) return;

    setLoading(true);
    
    // Fetch public profile and associated data
    Promise.all([
      apiGet(`/api/users/${userId}/public`).catch(() => null),
      apiGet(`/api/follows/${userId}/status`).catch(() => ({ isFollowing: false })),
      apiGet(`/api/farms/user/${userId}`).catch(() => [])
    ]).then(([profileData, followData, farmsData]) => {
      if (profileData && profileData.profile) {
        setProfile({
          ...profileData.profile,
          createdAt: profileData.profile.created_at || null
        });
        setPosts(profileData.posts || []);
        setFollowerCount(profileData.followerCount || 0);
        setFollowingCount(profileData.followingCount || 0);
      } else {
        setProfile({
          clerkUserId: userId,
          fullName: "Farmer",
          usernameHandle: "farmer",
          district: "Unknown"
        });
      }
      setIsFollowing(followData?.isFollowing || false);
      setFarms(farmsData || []);
    }).finally(() => setLoading(false));
  }, [userId, isOwnProfile, navigate]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await apiDelete(`/api/follows/${userId}`);
      } else {
        await apiPost(`/api/follows/${userId}`, {});
      }
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Follow error", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-gold-100">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-gold-100">Profile not found</div>;
  }

  const userStats = {
    totalAcres: farms.reduce((sum, f) => sum + (f.areaAcres || 0), 0),
    cropsGrowing: farms.filter(f => f.cropFocus || f.currentCrop).length,
    totalPosts: posts.length,
    reputation: "N/A",
  };

  const avatarUrl = profile.profilePictureUrl;
  const initial = (profile.fullName || profile.usernameHandle || 'U').charAt(0).toUpperCase();

  return (
    <div className="w-full relative animate-fade-in min-h-screen bg-[#0A0A0A] pb-24 pt-16">
      
      {/* COVER PHOTO */}
      <div className="relative h-48 md:h-56 w-full bg-gradient-to-br from-[#1a1a0e] to-[#0A0A0A] overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* PROFILE HEADER */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end w-full md:w-auto">
            {/* AVATAR */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0A0A0A] bg-[#1a1a0e] flex items-center justify-center overflow-hidden z-10 shadow-xl flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-4xl font-serif">
                  {initial}
                </div>
              )}
            </div>
            
            {/* INFO */}
            <div className="mt-2 md:mt-0 md:pb-2 flex-1">
              <h1 className="text-2xl md:text-3xl font-serif text-[#F5F0E8] leading-tight">
                {profile.fullName || 'Anonymous Farmer'}
              </h1>
              <p className="text-[#C9A84C] text-sm md:text-base font-medium">@{profile.usernameHandle}</p>
              <p className="text-[#F5F0E8]/40 text-xs md:text-sm mt-1.5 flex items-center gap-1.5">
                <MapPin size={14} /> {profile.district || 'Unknown District'} {profile.createdAt ? `· Farmer since ${new Date(profile.createdAt).getFullYear()}` : ''}
              </p>
              {profile.bio && (
                <p className="text-[#F5F0E8]/70 text-sm mt-3 max-w-md line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 pb-2">
            <button
              onClick={handleFollow}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                isFollowing
                  ? 'bg-[#1E1E1E] text-[#F5F0E8] border border-[#C9A84C]/30 hover:border-red-400/50 hover:text-red-400'
                  : 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#D4B86A] shadow-gold-glow'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={() => navigate(`/messages/${userId}`)}
              className="flex-1 md:flex-none px-6 py-2.5 bg-[#1E1E1E] text-[#F5F0E8] rounded-lg font-bold text-xs uppercase tracking-widest border border-[#1E1E1E] hover:border-[#C9A84C]/30 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} /> Message
            </button>
          </div>
        </div>

        {/* FOLLOW STATS */}
        <div className="flex gap-6 text-center mb-8 px-2 md:px-0">
          <button onClick={() => navigate(`/profile/${userId}/followers`)} className="hover:opacity-80 flex items-center gap-2">
            <p className="text-[#F5F0E8] font-bold text-sm">{followerCount}</p>
            <p className="text-[#F5F0E8]/40 text-xs uppercase tracking-widest">followers</p>
          </button>
          <button onClick={() => navigate(`/profile/${userId}/following`)} className="hover:opacity-80 flex items-center gap-2">
            <p className="text-[#F5F0E8] font-bold text-sm">{followingCount}</p>
            <p className="text-[#F5F0E8]/40 text-xs uppercase tracking-widest">following</p>
          </button>
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
          {(["posts", "farms"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative px-1 ${
                activeTab === tab ? "text-[#C9A84C]" : "text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70"
              }`}
            >
              {tab === "farms" ? "Farms" : "Posts"}
              {activeTab === tab && (
                <motion.div
                  layoutId="public-profile-tab-indicator"
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
                        <span>{post.likes_count || post.likes || 0} likes</span>
                        <span>{post.comments_count || post.comments || 0} comments</span>
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
                      crop={farm.cropFocus || farm.currentCrop}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default PublicProfile;
