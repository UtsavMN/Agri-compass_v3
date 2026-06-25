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

export const MOCK_USERS = [
  { id: 'dev_user', username: null as string | null, name: null as string | null }, // TODO: fetch real user from auth provider
  { id: 'user_a', username: null as string | null, name: null as string | null },
  { id: 'user_b', username: null as string | null, name: null as string | null },
];

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

// Helper to compute derived user/profile from activeUserId
const getDerivedAuth = (activeUserId: string, profileOverrides: Partial<Profile> = {}) => {
  const activeMock = MOCK_USERS.find(u => u.id === activeUserId) || MOCK_USERS[0];
  const mockUser = {
    id: activeMock.id,
    username: activeMock.username,
    firstName: activeMock.name ? activeMock.name.split(' ')[0] : null,
    lastName: activeMock.name ? activeMock.name.split(' ')[1] || '' : null,
    fullName: activeMock.name,
    email: null, // TODO: fetch from real auth provider
    primaryEmailAddress: { emailAddress: null }
  };
  const profile: Profile = {
    id: mockUser.id,
    username: mockUser.username,
    full_name: mockUser.fullName,
    email: mockUser.primaryEmailAddress.emailAddress,
    district: null,
    phone: null,
    location: null,
    language_preference: null,
    ...profileOverrides,
  };
  return { user: mockUser, profile, session: { id: "mock-session-123", getToken: async () => "mock-token" } };
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      const initialAuth = getDerivedAuth('dev_user');

      return {
        // Auth Slice
        activeUserId: 'dev_user',
        ...initialAuth,
        loading: false,
        switchUser: (userId: string) => {
          set(() => {
             const derived = getDerivedAuth(userId);
             return { activeUserId: userId, ...derived };
          });
          window.location.reload();
        },
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
          get().switchUser('dev_user');
        },

        // District Slice
        selectedDistrict: '',
        setSelectedDistrict: async (district: string) => {
          set({ selectedDistrict: district });
          const { user } = get();
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
