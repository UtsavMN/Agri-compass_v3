import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUser, MOCK_USERS } from '@/store';
import { useDistrict } from '@/store';
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
import { Plus, ImagePlus, Video, Search, Calendar, MapPin, X, Activity, Filter, MessageSquare, ShoppingCart } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { Marketplace } from '@/features/community/components/Marketplace'

const TOPICS = [
  { id: 'all', label: 'All Feed', keywords: [] },
  { id: 'crops', label: 'Crops & Seeds', keywords: ['crop', 'seed', 'paddy', 'rice', 'ragi', 'sugarcane', 'cotton', 'bel', 'bennu', 'ಬೆಳೆ', 'ಭತ್ತ', 'ರಾಗಿ', 'ಹತ್ತಿ', 'ತೊಗರಿ'] },
  { id: 'market', label: 'Market & Prices', keywords: ['price', 'mandi', 'market', 'cost', 'rate', 'rupees', 'rate', 'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'ದರ', 'ರೂಪಾಯಿ', 'ಮಾರುಕಟ್ಟೆಯ'] },
  { id: 'weather', label: 'Weather & Water', keywords: ['weather', 'rain', 'water', 'monsoon', 'temperature', 'ಮಳೆ', 'ಹವಾಮಾನ', 'ನೀರು', 'ಬೆಳೆ'] },
  { id: 'fertilizer', label: 'Soil & Fertilizer', keywords: ['fertilizer', 'soil', 'n-p-k', 'urea', 'potash', 'gobbara', 'ಮಣ್ಣು', 'ಗೊಬ್ಬರ', 'ಯೂರಿಯಾ'] }
]

const COMMUNITY_TABS = [
  { id: 'feed',      label: 'Kisan Feed',   icon: MessageSquare },
  { id: 'marketplace', label: 'Buy & Sell', icon: ShoppingCart, badge: 'New' },
]

export default function Community() {
  const { user } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { selectedDistrict } = useDistrict()
  const [activeTab, setActiveTab] = useState<'feed' | 'marketplace'>('feed')

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
  const [showOnlyLocal, setShowOnlyLocal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('all')

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
      const msg = (error as any)?.message ?? String(error)
      toast({
        title: 'Connection error',
        description: msg || 'Could not connect to community feed.',
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

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const highlightMatch = (text: string, query: string, caseSensitive = false) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${escapeRegExp(query)})`, caseSensitive ? '' : 'i')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-gold-400 text-earth-main font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const filteredPosts = useMemo(() => {
    const query = debouncedQuery.toLowerCase()
    return posts
      .filter(post => {
        if (showOnlyLocal && selectedDistrict) {
          return post.location?.toLowerCase().includes(selectedDistrict.toLowerCase())
        }
        return true
      })
      .filter(post => {
        if (selectedTopic === 'all') return true
        const topicObj = TOPICS.find(t => t.id === selectedTopic)
        if (!topicObj) return true
        const content = ((post.body || post.content || '') + ' ' + (post.location || '')).toLowerCase()
        return topicObj.keywords.some(keyword => content.includes(keyword))
      })
      .filter(post => {
        if (!query) return true
        return (post.body || post.content || '').toLowerCase().includes(query) || 
               (post.user?.username || post.user?.full_name || '').toLowerCase().includes(query)
      })
      .filter(post => {
        if (!filterDate) return true
        if (!post.created_at) return false
        try {
          const postDate = new Date(post.created_at)
          return postDate.toISOString().slice(0, 10) === filterDate
        } catch (e) {
          return false
        }
      })
  }, [posts, selectedDistrict, debouncedQuery, filterDate, showOnlyLocal, selectedTopic])

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return
    setIsLoading(true)
    try {
      const mediaUrls: string[] = []
      if (mediaFiles.length > 0) {
        toast({ title: 'Uploading media...' })
        const urls = await UploadAPI.uploadMultipleMedia(mediaFiles, 'posts')
        mediaUrls.push(...urls)
      }

      await PostsAPI.createPost({
        user_id: user?.id || '',
        body: newPostContent,
        location: selectedDistrict || '',
        images: mediaUrls,
      })

      setNewPostContent('')
      setMediaFiles([])
      setIsCreatingPost(false)
      fetchPosts()
      toast({
        title: 'Post shared',
        description: 'Your post is now visible in the community feed.'
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: 'Could not post',
        description: 'The community feed is temporarily unavailable.',
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
    }
  }

  const handleComment = async (postId: string, content: string) => {
    if (!user?.id) return;
    try {
      await PostsAPI.addComment(postId, user.id, content);
      fetchPosts()
      toast({ title: 'Comment added' })
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await PostsAPI.deletePost(postId)
      fetchPosts()
      toast({ title: 'Post deleted' })
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <Layout>
      <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Tab switch bar */}
            <div className="flex gap-2 border-b border-earth-border/40 pb-4 mb-4 select-none">
              {COMMUNITY_TABS.map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border',
                      isActive
                        ? 'bg-[#c49a2a] text-[#0f0f0b] border-[#c49a2a] shadow-gold-glow'
                        : 'border-[rgba(255,255,255,0.08)] text-[#a09880] hover:text-[#f0ece0] hover:border-white/10 bg-[#151a18]'
                    )}
                  >
                    <IconComponent size={14} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] bg-red-500/20 border border-red-500/30 text-red-400 font-extrabold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === 'feed' ? (
              <>
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                     <div>
                        <h1 className="text-4xl font-black text-gold-100 tracking-tight uppercase">Kisan Feed</h1>
                        <p className="text-gold-100/40 text-xs font-bold uppercase tracking-[0.3em] mt-2">Connect · Share · Learn with farmers near you</p>
                     </div>
                     <Button
                       onClick={() => setIsCreatingPost(true)}
                       className="btn-gold h-14 px-10 shadow-gold-glow group"
                     >
                       <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                       Share with community
                     </Button>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2}>
                  <Card className="card-premium p-1 border-none shadow-premium bg-earth-elevated/20">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
                      <div className="md:col-span-7 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-400/40" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setSuggestionsOpen(true)
                          }}
                          placeholder="FILTER BY KEYWORDS, USERS, OR CROPS..."
                          className="bg-transparent border-none text-gold-100 h-16 rounded-none pl-14 pr-10 text-[10px] font-black uppercase tracking-widest placeholder:text-gold-100/10 focus:ring-0"
                        />
                        {searchQuery && (
                           <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-100/20 hover:text-gold-400">
                              <X size={14} />
                           </button>
                        )}
                      </div>
                      <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-earth-border/50 relative">
                         <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-400/40" />
                         <Input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="bg-transparent border-none text-gold-100 h-16 rounded-none pl-14 text-[10px] font-black uppercase tracking-widest focus:ring-0 [color-scheme:dark]"
                         />
                      </div>
                      <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-earth-border/50 flex items-center justify-center bg-gold-400/5">
                         <button 
                          onClick={() => setShowOnlyLocal(!showOnlyLocal)}
                          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showOnlyLocal && selectedDistrict ? 'text-gold-400' : 'text-gold-100/20 hover:text-gold-100/40'}`}
                         >
                            <Filter size={12} /> {showOnlyLocal ? 'Local' : 'Global'}
                         </button>
                      </div>
                    </div>
                  </Card>
                  
                  {selectedDistrict && showOnlyLocal && (
                     <div className="flex items-center gap-2 mt-4 px-2">
                        <MapPin size={10} className="text-gold-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-100/30">Feed Restricted to district: <span className="text-gold-400">{selectedDistrict}</span></span>
                     </div>
                  )}
                </ScrollReveal>

                {/* Topic Filter Pills */}
                <ScrollReveal direction="up" delay={0.25}>
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                          selectedTopic === topic.id
                            ? 'bg-gold-500 text-earth-main border-gold-500 shadow-gold-glow'
                            : 'bg-earth-card text-gold-100/60 border-earth-border hover:border-gold-500/40 hover:text-gold-100'
                        }`}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </ScrollReveal>

                <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
                  <DialogContent className="bg-earth-elevated border-earth-border text-gold-100 sm:max-w-[500px] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 border-b border-earth-border bg-earth-card">
                      <DialogTitle className="text-2xl font-black tracking-tight text-gold-100 uppercase">Create New Post</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-8">
                      <Textarea
                        placeholder="Share your harvest updates, questions, or farming tips..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[150px] bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-2xl p-6 text-sm placeholder:text-gold-100/10 italic leading-relaxed"
                      />
                      
                      <div
                        {...getRootProps()}
                        className="border border-dashed border-gold-400/20 rounded-[2rem] p-10 text-center cursor-pointer hover:border-gold-400/50 hover:bg-gold-400/5 transition-all group"
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex gap-6">
                            <ImagePlus className="h-8 w-8 text-gold-100/20 group-hover:text-gold-400 transition-all" />
                            <Video className="h-8 w-8 text-gold-100/20 group-hover:text-gold-400 transition-all" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-100/30 group-hover:text-gold-100 transition-colors">Attach Photos / Videos</p>
                        </div>
                      </div>

                      {mediaFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {mediaFiles.map((file, index) => (
                            <Badge key={index} className="bg-gold-400/10 text-gold-400 border border-gold-400/20 py-1.5 px-4 rounded-full text-[9px] font-black uppercase tracking-widest">
                               {file.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button onClick={handleCreatePost} disabled={isLoading || (!newPostContent.trim() && mediaFiles.length === 0)} className="btn-gold w-full h-16 text-xs font-black uppercase tracking-[0.3em] shadow-gold-glow">
                        {isLoading ? <Activity className="h-5 w-5 animate-spin" /> : 'Post to Feed'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="space-y-8 pb-32">
                  {isFetchingPosts ? (
                    <PostListSkeleton />
                  ) : filteredPosts.length > 0 ? (
                    <StaggerContainer staggerDelay={0.1}>
                      <div className="space-y-8">
                        {filteredPosts.map((post) => (
                          <StaggerItem key={post.id}>
                             <PostCard
                                post={{
                                  id: post.id,
                                  content: post.body || post.content || '',
                                  kn_caption: post.kn_caption,
                                  images: post.images,
                                  video_url: post.video_url,
                                  location: post.location,
                                  created_at: post.created_at,
                                  user: post.user,
                                  _count: post._count,
                                  isLiked: post.isLiked,
                                }}
                                currentUserId={user?.id}
                                onLike={handleLike}
                                onComment={handleComment}
                                onDelete={handleDeletePost}
                                onShare={(postId: string) => {
                                  navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
                                  toast({ title: 'Post link copied' })
                                }}
                              />
                          </StaggerItem>
                        ))}
                      </div>
                    </StaggerContainer>
                  ) : (
                    <div className="py-12">
                      {posts.length === 0 ? (
                        <EmptyState
                          icon={MessageSquare}
                          title="No posts found"
                          description="Share your first harvest update or ask a farming question to the community!"
                          action={{
                            label: "Create Post",
                            onClick: () => setIsCreatingPost(true)
                          }}
                        />
                      ) : (
                        <EmptyState
                          icon={Filter}
                          title="No matching posts"
                          description="Try resetting the search filters or search term to see more posts."
                          action={{
                            label: "Reset Filters",
                            onClick: () => {
                              setSearchQuery('')
                              setFilterDate('')
                              setShowOnlyLocal(false)
                              setSelectedTopic('all')
                            }
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Marketplace />
            )}
          </div>
    </div>
    </Layout>
  )
}
