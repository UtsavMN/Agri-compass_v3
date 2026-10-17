import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiPut } from '@/lib/httpClient';

export interface Profile {
  id: string;
  username: string | null;
  usernameHandle?: string | null;
  full_name: string | null;
  fullName?: string | null;
  email: string | null;
  district: string | null;
  phone: string | null;
  location: string | null;
  language_preference: string | null;
  bio?: string | null;
  language?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  profile_picture_url?: string | null;
  profilePictureUrl?: string | null;
  cover_photo_url?: string | null;
  created_at?: string | null;
  preferences?: string | null;
}

export function normalizeProfile(p: any): Profile | null {
  if (!p) return null;
  const avatar = p.avatar_url || p.profile_picture_url || p.avatarUrl || p.profilePictureUrl || '';
  const fullName = p.full_name || p.fullName || '';
  const username = p.username || p.usernameHandle || p.username_handle || '';
  const district = p.district || p.location || '';
  return {
    ...p,
    id: p.id || p.clerkUserId || p.clerk_user_id || '',
    username,
    usernameHandle: username,
    full_name: fullName,
    fullName,
    district,
    location: district,
    phone: p.phone || '',
    bio: p.bio || '',
    language: p.language || p.language_preference || 'en',
    avatar_url: avatar,
    avatarUrl: avatar,
    profile_picture_url: avatar,
    profilePictureUrl: avatar,
    cover_photo_url: p.cover_photo_url || p.coverPhotoUrl || '',
    preferences: p.preferences || '{}',
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AuthSlice {
  activeUserId: string;
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  setClerkUserAndProfile: (clerkUser: any, profile: any) => void;
}

interface DistrictSlice {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
}

interface NotificationSlice {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

type StoreState = AuthSlice & DistrictSlice & NotificationSlice;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      return {
        // Auth Slice
        activeUserId: '',
        user: null,
        profile: null,
        session: null,
        loading: false,
        switchUser: (_userId: string) => {},
        updateProfile: async (data: Partial<Profile>) => {
          const { user, profile, activeUserId } = get();
          const nextProfile = normalizeProfile({ ...profile, ...data }) as Profile;
          set({ profile: nextProfile });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: nextProfile }));
          }

          const targetUserId = user?.id || activeUserId || profile?.id;
          try {
            const res = await apiPut(`/api/profiles`, {
              ...data,
              userId: targetUserId,
              clerkUserId: targetUserId,
            });
            if (res) {
              const fresh = normalizeProfile(res);
              set({ profile: fresh });
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: fresh }));
              }
            }
          } catch (error) {
            console.warn('Profile saved locally but backend sync failed:', error);
          }
        },
        signOut: async () => {
          set({ activeUserId: '', user: null, profile: null, session: null });
        },
        setClerkUserAndProfile: (clerkUser: any, profile: any) => {
          const norm = normalizeProfile(profile);
          set({
            activeUserId: clerkUser?.id || profile?.clerkUserId || profile?.id || '',
            user: clerkUser,
            profile: norm,
            selectedDistrict: norm?.district && norm.district !== 'Unknown' ? norm.district : get().selectedDistrict || ''
          });
          if (typeof window !== 'undefined' && norm) {
            window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: norm }));
          }
        },

        // District Slice
        selectedDistrict: '',
        setSelectedDistrict: async (district: string) => {
          set({ selectedDistrict: district });
          const { user, profile } = get();
          if (profile) {
            set({ profile: { ...profile, district } });
          }
          if (user?.id && district) {
            try {
              await apiPut(`/api/profiles/${user.id}`, { location: district });
            } catch (err) {
              console.error('Failed to sync district with profile:', err);
            }
          }
        },

        // Notification Slice
        notifications: [],
        addNotification: (notification) => {
          const newNotif: Notification = {
            id: Math.random().toString(36).substring(2, 9),
            ...notification,
            read: false,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ notifications: [newNotif, ...state.notifications] }));
        },
        markAsRead: (id: string) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        },
        clearNotifications: () => {
          set({ notifications: [] });
        },
      };
    },
    {
      name: 'agri-compass-store',
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        profile: state.profile,
        selectedDistrict: state.selectedDistrict,
      }),
    }
  )
);

// Selector hooks
export const useUser = () => {
  return useStore(useShallow((state) => ({
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    signOut: state.signOut,
    updateProfile: state.updateProfile,
    switchUser: state.switchUser,
  })));
};

export const useDistrict = () => {
  return useStore(useShallow((state) => ({
    selectedDistrict: state.selectedDistrict,
    setSelectedDistrict: state.setSelectedDistrict,
  })));
};

export const useNotifications = () => {
  return useStore(useShallow((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    markAsRead: state.markAsRead,
    clearNotifications: state.clearNotifications,
  })));
};
