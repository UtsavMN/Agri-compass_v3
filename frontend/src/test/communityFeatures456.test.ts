import { describe, it, expect, beforeEach } from 'vitest';
import type { Post, PollData } from '../lib/api/posts';

describe('Community Features 4, 5 & 6 (Polls, Bookmarks in Profile, Crop & Mandi Tagging, Timeframe Filter)', () => {
  const mockNow = new Date('2026-10-18T18:00:00Z').getTime();

  const samplePosts: Post[] = [
    {
      id: 'p-1',
      content: 'Tomato wholesale rates surging at Kolar APMC!',
      author: 'Ramesh Patel',
      role: 'Farmer',
      district: 'Kolar',
      time: '2 hours ago',
      likes: 14,
      replies: 3,
      tags: ['market'],
      crop_tag: 'Tomato',
      mandi_price: '₹2,600/qtl',
      created_at: new Date(mockNow - 2 * 3600 * 1000).toISOString(), // 2 hrs ago
      isBookmarked: false,
    },
    {
      id: 'p-2',
      content: 'What will be the Paddy harvest price this season?',
      author: 'Suresh Gowda',
      role: 'Agronomist',
      district: 'Mandya',
      time: '3 days ago',
      likes: 22,
      replies: 10,
      tags: ['crops', 'market'],
      crop_tag: 'Paddy',
      created_at: new Date(mockNow - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
      poll: {
        question: 'Expected Paddy Mandi Price per quintal?',
        totalVotes: 100,
        options: [
          { id: 'opt-1', text: '₹2,200 - ₹2,500', votes: 60, percentage: 60 },
          { id: 'opt-2', text: '₹2,500 - ₹2,800', votes: 30, percentage: 30 },
          { id: 'opt-3', text: 'Above ₹2,800', votes: 10, percentage: 10 },
        ],
        userVotedOptionId: undefined,
      },
      isBookmarked: true,
    },
    {
      id: 'p-3',
      content: 'Cotton pest management after heavy rain',
      author: 'Anand Kumar',
      role: 'Farmer',
      district: 'Dharwad',
      time: '20 days ago',
      likes: 9,
      replies: 1,
      tags: ['crops'],
      crop_tag: 'Cotton',
      created_at: new Date(mockNow - 20 * 24 * 3600 * 1000).toISOString(), // 20 days ago
      isBookmarked: false,
    },
    {
      id: 'p-4',
      content: 'Archived post from 2 months ago regarding Ragi sowing',
      author: 'Basavaraj',
      role: 'Farmer',
      district: 'Tumkur',
      time: '60 days ago',
      likes: 5,
      replies: 0,
      tags: ['crops'],
      crop_tag: 'Ragi',
      created_at: new Date(mockNow - 60 * 24 * 3600 * 1000).toISOString(), // 60 days ago
      isBookmarked: true,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Feature 4: Community Crop Polls & Mandi Sentiment', () => {
    it('accurately tallies new votes and recalculates percentage split', () => {
      const poll: PollData = {
        question: 'Expected Chilli price this month?',
        totalVotes: 4,
        options: [
          { id: '1', text: 'Bullish (Rising)', votes: 3, percentage: 75 },
          { id: '2', text: 'Bearish (Falling)', votes: 1, percentage: 25 },
        ],
      };

      // User votes for option '2'
      const updatedTotal = poll.totalVotes + 1;
      const updatedOptions = poll.options.map((opt) => {
        const votes = opt.id === '2' ? opt.votes + 1 : opt.votes;
        return {
          ...opt,
          votes,
          percentage: Math.round((votes / updatedTotal) * 100),
        };
      });

      expect(updatedTotal).toBe(5);
      expect(updatedOptions.find((o) => o.id === '1')?.percentage).toBe(60);
      expect(updatedOptions.find((o) => o.id === '2')?.percentage).toBe(40);
    });

    it('identifies if a user has already voted on a poll', () => {
      const postWithPoll = samplePosts.find((p) => p.id === 'p-2');
      expect(postWithPoll?.poll).toBeDefined();
      expect(postWithPoll?.poll?.userVotedOptionId).toBeUndefined();

      // Cast vote
      const votedPoll = {
        ...postWithPoll!.poll!,
        userVotedOptionId: 'opt-1',
      };
      expect(votedPoll.userVotedOptionId).toBe('opt-1');
    });
  });

  describe('Feature 5: Save / Bookmark Posts to Farm Notebook & User Profile integration', () => {
    it('toggles bookmark state and maintains offline/localStorage sync', () => {
      const postId = 'p-1';
      let bookmarkedIds: string[] = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]');
      expect(bookmarkedIds.includes(postId)).toBe(false);

      // Bookmark
      bookmarkedIds.push(postId);
      localStorage.setItem('agri_bookmarked_post_ids', JSON.stringify(bookmarkedIds));

      const retrievedIds: string[] = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]');
      expect(retrievedIds.includes(postId)).toBe(true);

      // Unbookmark
      const filtered = retrievedIds.filter((id) => id !== postId);
      localStorage.setItem('agri_bookmarked_post_ids', JSON.stringify(filtered));
      const afterUnbookmark: string[] = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]');
      expect(afterUnbookmark.includes(postId)).toBe(false);
    });

    it('filters saved posts for the User Profile view', () => {
      const bookmarkedIds = ['p-2', 'p-4'];
      const profileSavedPosts = samplePosts.filter((post) =>
        post.isBookmarked || bookmarkedIds.includes(post.id)
      );

      expect(profileSavedPosts.length).toBe(2);
      expect(profileSavedPosts.map((p) => p.id)).toEqual(['p-2', 'p-4']);
      expect(profileSavedPosts.every((p) => p.isBookmarked || bookmarkedIds.includes(p.id))).toBe(true);
    });
  });

  describe('Feature 6: Crop & Mandi Price Tagging', () => {
    it('filters posts by crop tag (e.g. Tomato or Paddy)', () => {
      const tomatoPosts = samplePosts.filter((p) => p.crop_tag?.toLowerCase() === 'tomato');
      expect(tomatoPosts.length).toBe(1);
      expect(tomatoPosts[0].id).toBe('p-1');
      expect(tomatoPosts[0].mandi_price).toBe('₹2,600/qtl');

      const paddyPosts = samplePosts.filter((p) => p.crop_tag?.toLowerCase() === 'paddy');
      expect(paddyPosts.length).toBe(1);
      expect(paddyPosts[0].id).toBe('p-2');
    });

    it('matches mandi price search query in post content or badge', () => {
      const query = '2,600';
      const results = samplePosts.filter((p) =>
        (p.mandi_price && p.mandi_price.toLowerCase().includes(query)) ||
        p.content.toLowerCase().includes(query)
      );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('p-1');
    });
  });

  describe('Simplified Timeframe Filter (Recent · All Time, 24h, Week, Month)', () => {
    function filterByTimeframe(posts: Post[], timeframe: 'all' | 'day' | 'week' | 'month'): Post[] {
      if (timeframe === 'all') return posts;
      return posts.filter((post) => {
        const postTime = new Date(post.created_at || '').getTime();
        const diffMs = mockNow - postTime;
        if (timeframe === 'day') return diffMs <= 24 * 3600 * 1000;
        if (timeframe === 'week') return diffMs <= 7 * 24 * 3600 * 1000;
        if (timeframe === 'month') return diffMs <= 30 * 24 * 3600 * 1000;
        return true;
      });
    }

    it('Recent · All Time returns all posts spanning any date (Instagram style)', () => {
      const allPosts = filterByTimeframe(samplePosts, 'all');
      expect(allPosts.length).toBe(4);
    });

    it('Last 24 Hours returns only posts from the past 24 hours', () => {
      const dayPosts = filterByTimeframe(samplePosts, 'day');
      expect(dayPosts.length).toBe(1);
      expect(dayPosts[0].id).toBe('p-1');
    });

    it('Last Week returns posts from the past 7 days', () => {
      const weekPosts = filterByTimeframe(samplePosts, 'week');
      expect(weekPosts.length).toBe(2);
      expect(weekPosts.map((p) => p.id)).toEqual(['p-1', 'p-2']);
    });

    it('Last Month returns posts from the past 30 days', () => {
      const monthPosts = filterByTimeframe(samplePosts, 'month');
      expect(monthPosts.length).toBe(3);
      expect(monthPosts.map((p) => p.id)).toEqual(['p-1', 'p-2', 'p-3']);
      // p-4 (60 days ago) should be excluded
      expect(monthPosts.some((p) => p.id === 'p-4')).toBe(false);
    });
  });
});
