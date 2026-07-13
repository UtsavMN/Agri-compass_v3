import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/httpClient";

export interface Post {
  id: string;
  clerk_user_id: string;
  content: string;
  category: string;
  district: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  has_liked?: boolean;
}

export const useCommunityFeed = (category?: string, feedScope: 'global' | 'local' = 'global', district?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      let url = '/api/posts?page=1&limit=50';
      if (category && category !== 'All') {
        url += `&category=${category}`;
      }
      if (feedScope === 'local' && district) {
        url += `&location=${encodeURIComponent(district)}`;
      }
      
      const res = await apiGet(url);
      setPosts(res || []);
    } catch (err) {
      console.error("Failed to fetch community feed:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [category, feedScope, district]);

  useEffect(() => {
    let timeoutId: number;
    let isMounted = true;

    const poll = async () => {
      if (!isMounted) return;
      await fetchPosts();
      if (isMounted) {
        timeoutId = window.setTimeout(poll, 10000);
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};
