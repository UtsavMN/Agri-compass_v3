import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeProfile, useStore } from '../store';

describe('Global Store & Profile Normalization - White-Box Tests', () => {
  beforeEach(() => {
    useStore.setState({
      activeUserId: '',
      user: null,
      profile: null,
      selectedDistrict: '',
      notifications: [],
    });
  });

  it('normalizeProfile unifies polymorphic backend and Clerk profile keys', () => {
    // Legacy snake_case format
    const snakeCase = {
      clerk_user_id: 'user_123',
      full_name: 'Basavaraj Patil',
      username_handle: 'patil_farm',
      avatar_url: 'https://img.test/pic.png',
      location: 'Dharwad',
      language_preference: 'kn',
    };

    const norm1 = normalizeProfile(snakeCase);
    expect(norm1).not.toBeNull();
    expect(norm1?.id).toBe('user_123');
    expect(norm1?.fullName).toBe('Basavaraj Patil');
    expect(norm1?.full_name).toBe('Basavaraj Patil');
    expect(norm1?.username).toBe('patil_farm');
    expect(norm1?.avatarUrl).toBe('https://img.test/pic.png');
    expect(norm1?.district).toBe('Dharwad');
    expect(norm1?.language).toBe('kn');

    // Modern camelCase format
    const camelCase = {
      clerkUserId: 'user_456',
      fullName: 'Anita Gowda',
      username: 'anita_g',
      profilePictureUrl: 'https://img.test/anita.jpg',
      district: 'Mandya',
      language: 'en',
    };

    const norm2 = normalizeProfile(camelCase);
    expect(norm2).not.toBeNull();
    expect(norm2?.id).toBe('user_456');
    expect(norm2?.fullName).toBe('Anita Gowda');
    expect(norm2?.avatarUrl).toBe('https://img.test/anita.jpg');
    expect(norm2?.district).toBe('Mandya');
  });

  it('normalizeProfile returns null on falsy input', () => {
    expect(normalizeProfile(null)).toBeNull();
    expect(normalizeProfile(undefined)).toBeNull();
  });

  it('setClerkUserAndProfile updates active user, profile, and selected district', () => {
    const clerkUser = { id: 'user_clerk_99' };
    const rawProfile = {
      clerkUserId: 'user_clerk_99',
      fullName: 'Ramesh Patel',
      district: 'Haveri',
    };

    useStore.getState().setClerkUserAndProfile(clerkUser, rawProfile);

    const state = useStore.getState();
    expect(state.activeUserId).toBe('user_clerk_99');
    expect(state.user).toEqual(clerkUser);
    expect(state.profile?.fullName).toBe('Ramesh Patel');
    expect(state.selectedDistrict).toBe('Haveri');
  });

  it('notification actions add, mark as read, and clear notifications', () => {
    const store = useStore.getState();

    // Add notifications
    store.addNotification({ title: 'Rain Alert', message: 'Heavy shower expected' });
    store.addNotification({ title: 'Price Spike', message: 'Tomato up by 15%' });

    let notifs = useStore.getState().notifications;
    expect(notifs.length).toBe(2);
    expect(notifs[0].title).toBe('Price Spike');
    expect(notifs[0].read).toBe(false);

    // Mark as read
    const firstId = notifs[0].id;
    useStore.getState().markAsRead(firstId);

    notifs = useStore.getState().notifications;
    expect(notifs.find((n) => n.id === firstId)?.read).toBe(true);
    expect(notifs.find((n) => n.id !== firstId)?.read).toBe(false);

    // Clear all
    useStore.getState().clearNotifications();
    expect(useStore.getState().notifications).toEqual([]);
  });
});
