import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiPut } from '@/lib/httpClient';
import { KARNATAKA_DISTRICT_COORDINATES } from '@/lib/ai/weatherAdvisor';

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
          const newDistrict = data.district || data.location || nextProfile.district || nextProfile.location;
          
          const patch: Partial<StoreState> = { profile: nextProfile };
          if (newDistrict && newDistrict !== 'Unknown') {
            patch.selectedDistrict = newDistrict;
          }
          set(patch);

          const targetUserId = user?.id || activeUserId || profile?.id;
          if (typeof window !== 'undefined' && targetUserId) {
            try {
              localStorage.setItem(`agri_user_profile_${targetUserId}`, JSON.stringify(nextProfile));
            } catch (e) {
              console.warn('Could not cache user profile locally', e);
            }
            window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: nextProfile }));
          }

          if (typeof window !== 'undefined' && newDistrict && newDistrict !== 'Unknown') {
            try {
              const currentSettings = JSON.parse(localStorage.getItem('agri_compass_settings') || '{}');
              const coords = KARNATAKA_DISTRICT_COORDINATES[newDistrict] || { lat: 12.9716, lon: 77.5946 };
              const updatedSettings = {
                ...currentSettings,
                location: {
                  ...(currentSettings.location || {}),
                  district: newDistrict,
                  taluk: newDistrict,
                  placeName: newDistrict,
                  lat: coords.lat,
                  lng: coords.lon,
                }
              };
              localStorage.setItem('agri_compass_settings', JSON.stringify(updatedSettings));
              window.dispatchEvent(new CustomEvent('agri_compass_settings_updated', { detail: updatedSettings }));
              window.dispatchEvent(new CustomEvent('agri_location_changed', { detail: { district: newDistrict } }));
            } catch (e) {
              console.warn('Could not sync district into settings cache', e);
            }
          }

          try {
            const res = await apiPut(`/api/profiles`, {
              ...data,
              userId: targetUserId,
              clerkUserId: targetUserId,
            });
            if (res) {
              const fresh = normalizeProfile(res);
              set({ profile: fresh });
              if (typeof window !== 'undefined' && targetUserId) {
                localStorage.setItem(`agri_user_profile_${targetUserId}`, JSON.stringify(fresh));
                window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: fresh }));
              }
            }
          } catch (error) {
            console.warn('Profile sync /api/profiles failed, trying /api/profile/me fallback:', error);
            try {
              const resMe = await apiPut(`/api/profile/me`, {
                ...data,
                userId: targetUserId,
                clerkUserId: targetUserId,
              });
              if (resMe) {
                const fresh = normalizeProfile(resMe);
                set({ profile: fresh });
                if (typeof window !== 'undefined' && targetUserId) {
                  localStorage.setItem(`agri_user_profile_${targetUserId}`, JSON.stringify(fresh));
                }
              }
            } catch (err2) {
              console.warn('Profile persisted in local user storage:', err2);
            }
          }
        },
        signOut: async () => {
          set({ activeUserId: '', user: null, profile: null, session: null });
        },
        setClerkUserAndProfile: (clerkUser: any, profile: any) => {
          let norm = normalizeProfile(profile);
          const uid = clerkUser?.id || profile?.clerkUserId || profile?.id || '';

          // Check if user has previously customized profile saved in localStorage
          if (typeof window !== 'undefined' && uid) {
            try {
              const savedLocally = localStorage.getItem(`agri_user_profile_${uid}`);
              if (savedLocally) {
                const parsed = JSON.parse(savedLocally);
                const isDefaultServerProfile = (
                  (!norm?.full_name || norm.full_name === 'Farmer' || norm.full_name === 'New User' || norm.full_name === 'Anonymous Farmer') &&
                  (!norm?.district || norm.district === 'Bengaluru Urban' || norm.district === 'Unknown')
                );
                // If server returned default values but user had previously customized their profile, restore user edits!
                if (isDefaultServerProfile && (parsed.full_name || parsed.district || parsed.phone || parsed.bio || parsed.avatar_url)) {
                  norm = normalizeProfile({ ...norm, ...parsed });
                  // Sync user edits back to backend
                  apiPut('/api/profiles', {
                    ...parsed,
                    userId: uid,
                    clerkUserId: uid,
                  }).catch(() => {});
                } else if (norm) {
                  // Keep cache up to date
                  localStorage.setItem(`agri_user_profile_${uid}`, JSON.stringify(norm));
                }
              } else if (norm) {
                localStorage.setItem(`agri_user_profile_${uid}`, JSON.stringify(norm));
              }
            } catch (e) {
              console.warn('Could not read user profile cache', e);
            }
          }

          const resolvedDistrict = norm?.district && norm.district !== 'Unknown' 
            ? norm.district 
            : get().selectedDistrict || '';

          set({
            activeUserId: uid,
            user: clerkUser,
            profile: norm,
            selectedDistrict: resolvedDistrict
          });

          if (typeof window !== 'undefined' && resolvedDistrict) {
            try {
              const currentSettings = JSON.parse(localStorage.getItem('agri_compass_settings') || '{}');
              const coords = KARNATAKA_DISTRICT_COORDINATES[resolvedDistrict] || { lat: 12.9716, lon: 77.5946 };
              const updatedSettings = {
                ...currentSettings,
                location: {
                  ...(currentSettings.location || {}),
                  district: resolvedDistrict,
                  taluk: resolvedDistrict,
                  placeName: resolvedDistrict,
                  lat: coords.lat,
                  lng: coords.lon,
                }
              };
              localStorage.setItem('agri_compass_settings', JSON.stringify(updatedSettings));
            } catch (e) {}
          }

          if (typeof window !== 'undefined' && norm) {
            window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: norm }));
          }
        },

        // District Slice
        selectedDistrict: '',
        setSelectedDistrict: async (district: string) => {
          if (!district) return;
          set({ selectedDistrict: district });
          const { user, profile } = get();
          let updatedProfile = profile;
          if (profile) {
            updatedProfile = { ...profile, district, location: district };
            set({ profile: updatedProfile });
          }

          if (typeof window !== 'undefined') {
            if (user?.id && updatedProfile) {
              try {
                localStorage.setItem(`agri_user_profile_${user.id}`, JSON.stringify(updatedProfile));
              } catch (e) {}
              window.dispatchEvent(new CustomEvent('agri_profile_updated', { detail: updatedProfile }));
            }

            try {
              const currentSettings = JSON.parse(localStorage.getItem('agri_compass_settings') || '{}');
              const coords = KARNATAKA_DISTRICT_COORDINATES[district] || { lat: 12.9716, lon: 77.5946 };
              const updatedSettings = {
                ...currentSettings,
                location: {
                  ...(currentSettings.location || {}),
                  district,
                  taluk: district,
                  placeName: district,
                  lat: coords.lat,
                  lng: coords.lon,
                }
              };
              localStorage.setItem('agri_compass_settings', JSON.stringify(updatedSettings));
              window.dispatchEvent(new CustomEvent('agri_compass_settings_updated', { detail: updatedSettings }));
              window.dispatchEvent(new CustomEvent('agri_location_changed', { detail: { district } }));
            } catch (e) {}
          }

          if (user?.id) {
            try {
              await apiPut(`/api/profiles`, {
                userId: user.id,
                clerkUserId: user.id,
                district,
                location: district,
              });
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
