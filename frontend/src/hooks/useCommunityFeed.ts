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

export const useCommunityFeed = (category?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const url = category && category !== 'All'
        ? `/api/posts?category=${category}&page=1&limit=50`
        : `/api/posts?page=1&limit=50`;
      
      const res = await apiGet(url);
      setPosts(res || []);
    } catch (err) {
      console.error("Failed to fetch community feed:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPosts(); // immediate first fetch
    const interval = setInterval(fetchPosts, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};
