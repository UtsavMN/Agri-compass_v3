import { describe, it, expect } from 'vitest';

interface Post {
  id: string;
  content: string;
  district?: string;
  createdAt: string;
  likesCount: number;
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  crops: ['crop', 'seed', 'paddy', 'rice', 'ragi', 'sugarcane', 'cotton', 'ಬೆಳೆ', 'ಭತ್ತ', 'ರಾಗಿ', 'ಹತ್ತಿ'],
  market: ['price', 'mandi', 'market', 'cost', 'rate', 'rupees', 'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'ದರ'],
  weather: ['weather', 'rain', 'water', 'monsoon', 'temperature', 'ಮಳೆ', 'ಹವಾಮಾನ', 'ನೀರು'],
  fertilizer: ['fertilizer', 'soil', 'urea', 'potash', 'gobbara', 'ಮಣ್ಣು', 'ಗೊಬ್ಬರ', 'ಯೂರಿಯಾ'],
};

function filterPostsByTopic(posts: Post[], topic: string): Post[] {
  if (topic === 'all' || !TOPIC_KEYWORDS[topic]) return posts;
  const keywords = TOPIC_KEYWORDS[topic];
  return posts.filter((post) => {
    const text = post.content.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });
}

function filterPostsByScope(posts: Post[], scope: 'global' | 'local', userDistrict: string): Post[] {
  if (scope === 'global' || !userDistrict) return posts;
  return posts.filter((p) => p.district?.toLowerCase() === userDistrict.toLowerCase());
}

describe('Community Feed & Multilingual Keyword Filter Tests', () => {
  const samplePosts: Post[] = [
    { id: 'p1', content: 'Harvesting ragi this week in Mandya! Good yield.', district: 'Mandya', createdAt: '2026-10-18T10:00:00Z', likesCount: 5 },
    { id: 'p2', content: 'Mandi price for tomato reached ₹2500 per quintal in Kolar', district: 'Kolar', createdAt: '2026-10-18T11:00:00Z', likesCount: 12 },
    { id: 'p3', content: 'Heavy rain in Dharwad, postpone foliar spraying', district: 'Dharwad', createdAt: '2026-10-18T11:30:00Z', likesCount: 3 },
    { id: 'p4', content: 'ಈ ವಾರ ಭತ್ತದ ಬೆಳೆ ಕೊಯ್ಲು ಆರಂಭವಾಗಿದೆ', district: 'Mandya', createdAt: '2026-10-18T12:00:00Z', likesCount: 8 }, // Kannada for paddy crop
    { id: 'p5', content: 'Apply urea and neem cake after light irrigation', district: 'Haveri', createdAt: '2026-10-18T12:15:00Z', likesCount: 4 },
  ];

  it('filters posts accurately by English crop keywords', () => {
    const crops = filterPostsByTopic(samplePosts, 'crops');
    expect(crops.length).toBeGreaterThanOrEqual(2);
    expect(crops.some((p) => p.id === 'p1')).toBe(true);
  });

  it('filters posts accurately by Kannada crop keywords (e.g. ಭತ್ತ - paddy)', () => {
    const crops = filterPostsByTopic(samplePosts, 'crops');
    expect(crops.some((p) => p.id === 'p4')).toBe(true);
  });

  it('filters posts accurately by market and weather topics', () => {
    const market = filterPostsByTopic(samplePosts, 'market');
    expect(market.length).toBe(1);
    expect(market[0].id).toBe('p2');

    const weather = filterPostsByTopic(samplePosts, 'weather');
    expect(weather.length).toBe(1);
    expect(weather[0].id).toBe('p3');
  });

  it('filters posts by localized district scope', () => {
    const mandyaPosts = filterPostsByScope(samplePosts, 'local', 'Mandya');
    expect(mandyaPosts.length).toBe(2);
    mandyaPosts.forEach((p) => expect(p.district).toBe('Mandya'));

    const globalPosts = filterPostsByScope(samplePosts, 'global', 'Mandya');
    expect(globalPosts.length).toBe(5);
  });
});
