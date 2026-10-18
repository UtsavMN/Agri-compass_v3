import { apiGet, apiPost, apiDelete } from '../httpClient'

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage?: number
}

export interface PollData {
  question: string
  options: PollOption[]
  total_votes: number
  user_voted_option_id?: string | null
  has_voted?: boolean
}

export interface Post {
  id: string
  user_id: string
  title?: string
  body?: string
  content?: string
  crop_tags?: string[]
  crop_tag?: string | null
  mandi_price?: string | null
  poll?: PollData | null
  location?: string
  images?: string[]
  created_at: string
  updated_at?: string
  kn_caption?: string | null
  video_url?: string | null
  user: {
    id: string
    username: string
    avatar_url?: string
    full_name?: string
  }
  _count?: {
    likes: number
    comments: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url?: string
    full_name?: string
  }
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  ref_id: string // post_id or comment_id
  read: boolean
  created_at: string
}

export class PostsAPI {
  // GET /api/posts - Retrieve all posts in reverse chronological order with filters
  static async getPosts(filters?: {
    crop?: string
    location?: string
    user?: string
    q?: string
  }): Promise<Post[]> {
    try {
      let queryString = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.crop) params.append('crop', filters.crop);
        if (filters.location) params.append('location', filters.location);
        if (filters.user) params.append('user', filters.user);
        if (filters.q) params.append('q', filters.q);
        const qStr = params.toString();
        if (qStr) queryString = `?${qStr}`;
      }

      return await apiGet(`/api/posts${queryString}`);
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  // POST /api/posts - Create a new post
  static async createPost(postData: {
    user_id: string
    title?: string
    body: string
    crop_tags?: string[]
    crop_tag?: string
    mandi_price?: string
    poll?: PollData
    location?: string
    images?: string[]
    farm_id?: string
  }): Promise<Post> {
    try {
      return await apiPost('/api/posts', postData)
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  // DELETE /api/posts/:id - Delete a post
  static async deletePost(postId: string): Promise<void> {
    try {
      await apiDelete(`/api/posts/${postId}`)
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // POST /api/posts/:id/like - Like/unlike a post
  static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      return await apiPost(`/api/posts/${postId}/like`, { userId })
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // POST /api/posts/:id/bookmark - Bookmark/unbookmark a post
  static async toggleBookmark(postId: string, userId?: string): Promise<{ bookmarked: boolean; postId: string }> {
    try {
      const res = await apiPost(`/api/posts/${postId}/bookmark`, { userId })
      // Also update local storage cache for immediate offline responsiveness
      const stored = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]')
      const set = new Set(stored)
      if (res.bookmarked) {
        set.add(postId)
      } else {
        set.delete(postId)
      }
      localStorage.setItem('agri_bookmarked_post_ids', JSON.stringify(Array.from(set)))
      window.dispatchEvent(new CustomEvent('agri_bookmarks_updated'))
      return res
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      // Fallback local toggle if server error
      const stored = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]')
      const set = new Set(stored)
      const bookmarked = !set.has(postId)
      if (bookmarked) set.add(postId); else set.delete(postId)
      localStorage.setItem('agri_bookmarked_post_ids', JSON.stringify(Array.from(set)))
      window.dispatchEvent(new CustomEvent('agri_bookmarks_updated'))
      return { bookmarked, postId }
    }
  }

  // GET /api/posts/bookmarked - Get all bookmarked posts
  static async getBookmarkedPosts(userId?: string): Promise<Post[]> {
    try {
      const url = userId ? `/api/posts/bookmarked?userId=${encodeURIComponent(userId)}` : `/api/posts/bookmarked`
      const data = await apiGet(url)
      if (Array.isArray(data) && data.length > 0) return data

      // Fallback to local cached bookmarks if server returns empty or unauthenticated
      const storedIds: string[] = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]')
      if (storedIds.length === 0) return []
      const allPosts = await this.getPosts()
      return allPosts.filter(p => storedIds.includes(p.id))
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error)
      const storedIds: string[] = JSON.parse(localStorage.getItem('agri_bookmarked_post_ids') || '[]')
      if (storedIds.length === 0) return []
      const allPosts = await this.getPosts()
      return allPosts.filter(p => storedIds.includes(p.id))
    }
  }

  // POST /api/posts/:id/poll/vote - Vote on a poll
  static async votePoll(postId: string, optionId: string, userId?: string): Promise<PollData> {
    try {
      return await apiPost(`/api/posts/${postId}/poll/vote`, { optionId, userId })
    } catch (error) {
      console.error('Error voting on poll:', error)
      throw error
    }
  }

  // POST /api/posts/:id/comments - Add a comment to a post
  static async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    try {
      return await apiPost(`/api/posts/${postId}/comments`, { userId, content })
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  // GET /api/posts/:id/comments - Get comments for a post
  static async getComments(postId: string): Promise<Comment[]> {
    try {
      return await apiGet(`/api/posts/${postId}/comments`)
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  // GET /api/posts/:id - Get a single post by ID
  static async getPostById(postId: string): Promise<Post> {
    try {
      return await apiGet(`/api/posts/${postId}`)
    } catch (error) {
      console.error('Error fetching post by id:', error)
      throw error
    }
  }

  // GET /api/notifications - Get user notifications
  static async getNotifications(_userId: string): Promise<Notification[]> {
    try {
      return []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  // POST /api/notifications/:id/read - Mark notification as read
  static async markNotificationAsRead(_notificationId: string): Promise<void> {
    try {
      // Logic for marking read
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }
}

export async function getPosts() {
  return PostsAPI.getPosts()
}
