import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/httpClient";

interface UserProfile {
  clerkUserId: string;
  fullName: string;
  usernameHandle: string;
  profilePictureUrl?: string;
  district?: string;
}

export const FollowersPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    apiGet(`/api/follows/${userId}/followers`)
      .then(d => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A] max-w-2xl mx-auto px-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#F5F0E8]/50 hover:text-[#C9A84C] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[#F5F0E8] font-bold text-xl">Followers</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-[#F5F0E8]/50 text-center text-xs py-8">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-[#F5F0E8]/30 text-center text-xs py-8 font-semibold uppercase tracking-widest">No followers yet</p>
        ) : (
          users.map(user => (
            <div key={user.clerkUserId} className="flex items-center justify-between p-3 rounded-xl bg-[#1E1E1E] border border-white/5 cursor-pointer hover:border-[#C9A84C]/30 transition-colors" onClick={() => navigate(`/profile/${user.clerkUserId}`)}>
              <div className="flex items-center gap-3">
                <img src={user.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.clerkUserId}`} className="w-10 h-10 rounded-full border border-[#C9A84C]/20" />
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">{user.fullName}</p>
                  <p className="text-[10px] text-[#F5F0E8]/40">@{user.usernameHandle}</p>
                </div>
              </div>
              {user.district && <span className="text-[9px] text-[#C9A84C] uppercase tracking-widest bg-[#C9A84C]/10 px-2 py-1 rounded-full">{user.district}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default FollowersPage;
