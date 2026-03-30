import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'
import { useDistrictContext } from '@/contexts/DistrictContext'
import { PostsAPI, Post } from '@/lib/api/posts'
import { UploadAPI } from '@/lib/api/upload'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PostCard } from '@/components/ui/post-card'
import { useToast } from '@/hooks/use-toast'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { LottieEmptyState } from '@/components/ui/lottie-loading'
import { PostListSkeleton } from '@/components/ui/post-skeleton'
import { Plus, ImagePlus, Video } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function Community() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { selectedDistrict } = useDistrictContext()

  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingPosts, setIsFetchingPosts] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm']
    },
    onDrop: (acceptedFiles: File[]) => {
      setMediaFiles([...mediaFiles, ...acceptedFiles])
    }
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsFetchingPosts(true)
    try {
      const data = await PostsAPI.getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error fetching posts',
        description: msg || 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsFetchingPosts(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

  const highlightMatch = (text: string, query: string, caseSensitive = false) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${escapeRegExp(query)})`, caseSensitive ? '' : 'i')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-leaf-200 text-leaf-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const filterByDate = (post: Post) => {
    if (!filterDate) return true
    const postDate = new Date(post.created_at)
    return postDate.toISOString().slice(0, 10) === filterDate
  }

  const suggestedAccounts = useMemo(() => {
    if (!debouncedQuery) return []

    const results = posts.filter(post => post.user.username.includes(debouncedQuery))
    const uniqueUsers = new Map<string, Post>()
    results.forEach(post => {
      if (!uniqueUsers.has(post.user.username)) {
        uniqueUsers.set(post.user.username, post)
      }
    })

    return Array.from(uniqueUsers.values()).slice(0, 5)
  }, [posts, debouncedQuery])

  const suggestedPosts = useMemo(() => {
    if (!debouncedQuery) return []
    const query = debouncedQuery.toLowerCase()

    return posts
      .filter(post => filterByDate(post))
      .filter(post => (post.body || post.content || '').toLowerCase().includes(query))
      .slice(0, 5)
  }, [posts, debouncedQuery, filterDate])

  const filteredPosts = useMemo(() => {
    const query = debouncedQuery.toLowerCase()

    return posts
      .filter(post => {
        if (selectedDistrict) {
          return post.location?.toLowerCase().includes(selectedDistrict.toLowerCase())
        }
        return true
      })
      .filter(post => {
        if (!query) return true
        return (post.body || post.content || '').toLowerCase().includes(query)
      })
      .filter(filterByDate)
  }, [posts, selectedDistrict, debouncedQuery, filterDate])

  const handleSelectAccount = (username: string) => {
    setSearchQuery('')
    setSuggestionsOpen(false)
    navigate('/profile')
  }

  const handleSelectPost = (postId: string) => {
    setSearchQuery('')
    setSuggestionsOpen(false)
    navigate(`/post/${postId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSuggestionsOpen(true)
  }

  const handleDateChange = (value: string) => {
    setFilterDate(value)
    setSuggestionsOpen(true)
  }

  const currentDistrictBanner = selectedDistrict
    ? `Showing community posts for ${selectedDistrict}`
    : 'No district selected globally. Choose a district in Weather or Dashboard to auto-apply filters.'

  const showSuggestions = suggestionsOpen && Boolean(debouncedQuery)

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return

    setIsLoading(true)
    try {
      // Upload media files if any
      const mediaUrls: string[] = []
      if (mediaFiles.length > 0) {
        toast({ title: 'Uploading media...' })
        const urls = await UploadAPI.uploadMultipleMedia(mediaFiles, 'posts')
        mediaUrls.push(...urls)
      }

      // Create post
      await PostsAPI.createPost({
        user_id: user?.id || '',
        body: newPostContent,
        images: mediaUrls,
      })

      setNewPostContent('')
      setMediaFiles([])
      setIsCreatingPost(false)
      fetchPosts()
      toast({
        title: 'Post created successfully',
        description: 'Your post is now visible to the community'
      })
    } catch (error) {
      console.error('Error creating post:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error creating post',
        description: msg || 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user?.id) return;
    try {
      await PostsAPI.toggleLike(postId, user.id);
      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not like/unlike the post',
        variant: 'destructive'
      })
    }
  }

  const handleComment = async (postId: string, content: string) => {
    if (!user?.id) return;
    try {
      await PostsAPI.addComment(postId, user.id, content);

      fetchPosts()
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted'
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not add your comment',
        variant: 'destructive'
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await PostsAPI.deletePost(postId)
      fetchPosts()
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed'
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      const msg = (error as Record<string, unknown>)?.message as string ?? String(error)
      toast({
        title: 'Error',
        description: msg || 'Could not delete the post',
        variant: 'destructive'
      })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 relative">
        <Card className="mb-8 community-gradient">
          <div className="p-4">
            <Button
              onClick={() => setIsCreatingPost(true)}
              className="w-full flex items-center gap-2 dark:bg-black dark:hover:bg-black/80 dark:text-white border dark:border-slate-800 transition"
            >
              <Plus className="h-4 w-4" />
              Create a new post
            </Button>
          </div>
        </Card>

        <Card className="mb-6 p-4 community-gradient">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground dark:text-slate-200">Community search</label>
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search usernames (case-sensitive) or post keywords"
                className="mt-2 dark:bg-black dark:text-white dark:border-slate-700 dark:placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground dark:text-slate-200">Date filter (DD/MM/YYYY)</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="mt-2 dark:bg-black dark:text-white dark:border-slate-700 [color-scheme:light_dark]"
              />
            </div>
          </div>

          <p className="text-sm text-foreground/80 dark:text-slate-300 mt-3">{currentDistrictBanner}</p>

          {showSuggestions && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              {suggestedAccounts.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700">Accounts</p>
                  <div className="mt-2 space-y-2">
                    {suggestedAccounts.map((post) => (
                      <button
                        key={post.user.username}
                        type="button"
                        onClick={() => handleSelectAccount(post.user.username)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-leaf-50"
                      >
                        <span className="font-medium text-slate-900">@{highlightMatch(post.user.username, debouncedQuery, true)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {suggestedPosts.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Posts</p>
                  <div className="mt-2 space-y-2">
                    {suggestedPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => handleSelectPost(post.id)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-leaf-50"
                      >
                        <p className="font-medium text-slate-900">
                          {highlightMatch(post.body || post.content || '', debouncedQuery)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {suggestedAccounts.length === 0 && suggestedPosts.length === 0 && (
                <p className="text-sm text-slate-500">No matching accounts or posts found for "{debouncedQuery}".</p>
              )}
            </div>
          )}
        </Card>

        <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <ImagePlus className="h-6 w-6" />
                    <Video className="h-6 w-6" />
                  </div>
                  <p>Drop files here or click to upload</p>
                </div>
              </div>
              {mediaFiles.length > 0 && (
                <div className="grid gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-500">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleCreatePost} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ScrollReveal direction="up" delay={0.1}>
          {isFetchingPosts ? (
            <PostListSkeleton />
          ) : filteredPosts.length > 0 ? (
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid gap-4">
                {filteredPosts.map((post) => (
                  <StaggerItem key={post.id}>
                    <div className="card-mobile">
                      <PostCard
                            post={{
                              id: post.id,
                              content: post.body || post.content || '',
                              kn_caption: post.kn_caption || undefined,
                              images: post.images,
                              video_url: post.video_url ?? undefined,
                              created_at: post.created_at,
                              user: post.user,
                              _count: {
                                likes: post._count?.likes || 0,
                                comments: post._count?.comments || 0,
                              },
                              isLiked: post.isLiked,
                            }}
                        currentUserId={user?.id}
                        onLike={handleLike}
                        onComment={handleComment}
                        onDelete={handleDeletePost}
                        onShare={(postId: string) => {
                          navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
                        }}
                      />
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          ) : (
            <LottieEmptyState message={
              posts.length === 0
                ? 'No posts yet. Be the first to share something!'
                : 'No community posts match your search or selected date.'
            } />
          )}
        </ScrollReveal>

        {/* Floating create post button */}
        <button
          onClick={() => setIsCreatingPost(true)}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl"
          aria-label="Create Post"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </Layout>
  )
}
