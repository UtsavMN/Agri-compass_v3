import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/httpClient";

interface UserProfile {
  clerkUserId: string;
  fullName: string;
  usernameHandle: string;
  district: string;
  profilePictureUrl?: string;
  bio?: string;
}

interface Post {
  id: string;
  content: string;
}

export const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile'); // redirect to own profile
      return;
    }
    
    if (!userId) return;

    setLoading(true);
    // Fetch public profile data
    apiGet(`/api/users/${userId}/public`)
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          setPosts(data.posts || []);
          setFollowerCount(data.followerCount || 0);
          setFollowingCount(data.followingCount || 0);
        } else {
          throw new Error("Profile empty");
        }
      })
      .catch(err => {
        console.error("Failed to load profile", err);
        // Fallback generic profile
        setProfile({
          clerkUserId: userId,
          fullName: "Farmer",
          usernameHandle: "farmer",
          district: "Unknown"
        });
      })
      .finally(() => setLoading(false));

    // Check follow status
    apiGet(`/api/follows/${userId}/status`)
      .then(d => setIsFollowing(d.isFollowing))
      .catch(() => {});
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

  return (
    <div className="pt-24 min-h-screen bg-[#0A0A0A] max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Avatar + Stats row */}
      <div className="flex items-center gap-8 mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-[#C9A84C] overflow-hidden flex-shrink-0">
          {profile.profilePictureUrl
            ? <img src={profile.profilePictureUrl} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[#1E1E1E] flex items-center justify-center text-2xl text-[#C9A84C] font-bold">
                {profile.fullName?.[0] || '?'}
              </div>
          }
        </div>
        <div className="flex gap-6 text-center">
          <div><p className="text-[#F5F0E8] font-semibold text-lg">{posts.length}</p><p className="text-[#F5F0E8]/40 text-xs uppercase tracking-widest">posts</p></div>
          <button onClick={() => navigate(`/profile/${userId}/followers`)} className="hover:opacity-80">
            <p className="text-[#F5F0E8] font-semibold text-lg">{followerCount}</p><p className="text-[#F5F0E8]/40 text-xs uppercase tracking-widest">followers</p>
          </button>
          <button onClick={() => navigate(`/profile/${userId}/following`)} className="hover:opacity-80">
            <p className="text-[#F5F0E8] font-semibold text-lg">{followingCount}</p><p className="text-[#F5F0E8]/40 text-xs uppercase tracking-widest">following</p>
          </button>
        </div>
      </div>

      {/* Name + handle + district */}
      <div className="mb-4">
        <p className="text-[#F5F0E8] font-semibold text-lg">{profile.fullName}</p>
        <p className="text-[#F5F0E8]/40 text-sm">@{profile.usernameHandle}</p>
        <p className="text-[#F5F0E8]/30 text-sm mt-1 uppercase tracking-widest text-[10px] font-black">📍 {profile.district}, Karnataka</p>
        {profile.bio && <p className="text-[#F5F0E8]/70 text-sm mt-2">{profile.bio}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6 mt-6">
        <button
          onClick={handleFollow}
          className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
            isFollowing
              ? 'bg-[#1E1E1E] text-[#F5F0E8] border border-[#C9A84C]/30 hover:border-red-400/50 hover:text-red-400'
              : 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#D4B86A] shadow-gold-glow'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button
          onClick={() => navigate(`/messages/${userId}`)}
          className="flex-1 py-2.5 bg-[#1E1E1E] text-[#F5F0E8] rounded-lg font-bold text-xs uppercase tracking-widest border border-[#1E1E1E] hover:border-[#C9A84C]/30 transition-all"
        >
          Message
        </button>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-2 mt-8">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-[#151a18] border border-white/5 rounded-lg flex items-center justify-center p-3 hover:border-[#C9A84C]/30 transition-colors cursor-pointer overflow-hidden">
            <p className="text-[#F5F0E8]/50 text-[10px] line-clamp-4 text-center">{post.content}</p>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[#F5F0E8]/30 text-xs font-black uppercase tracking-widest">No posts yet</div>
        )}
      </div>
    </div>
  );
};
export default PublicProfile;
