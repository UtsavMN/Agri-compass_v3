import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiPut } from '@/lib/httpClient';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  district: string | null;
  phone: string | null;
  location: string | null;
  language_preference: string | null;
}

export const MOCK_USERS: any[] = [];

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
        switchUser: (userId: string) => {},
        updateProfile: async (data: Partial<Profile>) => {
          const { user, profile } = get();
          if (!user) return;
          const nextProfile = { ...profile, ...data } as Profile;
          set({ profile: nextProfile });
          try {
            await apiPut(`/api/profiles/${user.id}`, data);
          } catch (error) {
            console.warn('Profile saved locally but backend sync failed:', error);
          }
        },
        signOut: async () => {
          set({ activeUserId: '', user: null, profile: null, session: null });
        },
        setClerkUserAndProfile: (clerkUser: any, profile: any) => {
          set({
            activeUserId: clerkUser?.id || '',
            user: clerkUser,
            profile: profile,
            selectedDistrict: profile?.district && profile.district !== 'Unknown' ? profile.district : get().selectedDistrict || ''
          });
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
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);
  const session = useStore((state) => state.session);
  const loading = useStore((state) => state.loading);
  const signOut = useStore((state) => state.signOut);
  const updateProfile = useStore((state) => state.updateProfile);
  const switchUser = useStore((state) => state.switchUser);
  return { user, profile, session, loading, signOut, updateProfile, switchUser };
};

export const useDistrict = () => {
  const selectedDistrict = useStore((state) => state.selectedDistrict);
  const setSelectedDistrict = useStore((state) => state.setSelectedDistrict);
  return { selectedDistrict, setSelectedDistrict };
};

export const useNotifications = () => {
  const notifications = useStore((state) => state.notifications);
  const addNotification = useStore((state) => state.addNotification);
  const markAsRead = useStore((state) => state.markAsRead);
  const clearNotifications = useStore((state) => state.clearNotifications);
  return { notifications, addNotification, markAsRead, clearNotifications };
};
