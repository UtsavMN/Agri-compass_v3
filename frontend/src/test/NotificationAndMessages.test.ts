import { describe, it, expect } from 'vitest';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'BUY_SELL';
  actorName: string;
  targetId?: string;
  read: boolean;
  createdAt: string;
}

describe('Notification and Messaging System - Precision Business Logic Tests', () => {
  it('calculates unread messages count accurately and decrements when marked read', () => {
    const messages: Message[] = [
      { id: 'm1', senderId: 'u2', recipientId: 'me', content: 'Price per quintal?', isRead: false, createdAt: '2026-10-17T10:00:00Z' },
      { id: 'm2', senderId: 'u3', recipientId: 'me', content: 'Do you have Ragi seeds?', isRead: false, createdAt: '2026-10-17T10:05:00Z' },
      { id: 'm3', senderId: 'u4', recipientId: 'me', content: 'Thanks for the advice', isRead: true, createdAt: '2026-10-17T09:00:00Z' },
    ];

    const getUnreadCount = (msgs: Message[]) => msgs.filter((m) => !m.isRead).length;

    // Initial unread count should be 2
    expect(getUnreadCount(messages)).toBe(2);

    // User opens conversation with u2 -> marks m1 as read
    const updatedMessages = messages.map((m) => (m.id === 'm1' ? { ...m, isRead: true } : m));

    // Unread count reduces to 1
    expect(getUnreadCount(updatedMessages)).toBe(1);

    // User reads m2
    const allReadMessages = updatedMessages.map((m) => (m.id === 'm2' ? { ...m, isRead: true } : m));

    // Red dot / badge count drops to 0
    expect(getUnreadCount(allReadMessages)).toBe(0);
  });

  it('handles notification feed, unread indicator dot and mark as read lifecycle', () => {
    const notifications: NotificationItem[] = [
      { id: 'n1', type: 'LIKE', actorName: 'Ramesh Patel', read: false, createdAt: '2026-10-17T11:00:00Z' },
      { id: 'n2', type: 'COMMENT', actorName: 'Sunita Gowda', read: false, createdAt: '2026-10-17T11:15:00Z' },
      { id: 'n3', type: 'BUY_SELL', actorName: 'Kiran Traders', read: false, createdAt: '2026-10-17T11:20:00Z' },
      { id: 'n4', type: 'FOLLOW', actorName: 'Devappa', read: true, createdAt: '2026-10-17T08:00:00Z' },
    ];

    const hasUnreadNotifications = (list: NotificationItem[]) => list.some((n) => !n.read);
    const getUnreadBadge = (list: NotificationItem[]) => list.filter((n) => !n.read).length;

    // Has unread dot
    expect(hasUnreadNotifications(notifications)).toBe(true);
    expect(getUnreadBadge(notifications)).toBe(3);

    // Mark single notification as read
    const afterReadingOne = notifications.map((n) => (n.id === 'n1' ? { ...n, read: true } : n));
    expect(getUnreadBadge(afterReadingOne)).toBe(2);

    // Mark all as read
    const allRead = afterReadingOne.map((n) => ({ ...n, read: true }));
    expect(hasUnreadNotifications(allRead)).toBe(false);
    expect(getUnreadBadge(allRead)).toBe(0);
  });
});
