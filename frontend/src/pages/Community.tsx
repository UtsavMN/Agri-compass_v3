import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useDistrict } from '@/store';
import { PostsAPI } from '@/lib/api/posts'
import { UploadAPI } from '@/lib/api/upload'
import { useCommunityFeed } from '@/hooks/useCommunityFeed'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PostCard } from '@/components/ui/post-card'
import { useToast } from '@/hooks/use-toast'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/animations'

import { PostListSkeleton } from '@/components/ui/post-skeleton'
import { Plus, ImagePlus, Video, Search, Clock, X, Activity, Filter, MessageSquare, ShoppingCart, BarChart2, Tag, IndianRupee, Trash2, PlusCircle, Bookmark } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { Marketplace } from '@/features/community/components/Marketplace'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TOPICS = [
  { id: 'all', label: 'All Feed', keywords: [] },
  { id: 'crops', label: 'Crops & Seeds', keywords: ['crop', 'seed', 'paddy', 'rice', 'ragi', 'sugarcane', 'cotton', 'bel', 'bennu', 'ಬೆಳೆ', 'ಭತ್ತ', 'ರಾಗಿ', 'ಹತ್ತಿ', 'ತೊಗರಿ'] },
  { id: 'market', label: 'Market & Prices', keywords: ['price', 'mandi', 'market', 'cost', 'rate', 'rupees', 'rate', 'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'ದರ', 'ರೂಪಾಯಿ', 'ಮಾರುಕಟ್ಟೆಯ'] },
  { id: 'weather', label: 'Weather & Water', keywords: ['weather', 'rain', 'water', 'monsoon', 'temperature', 'ಮಳೆ', 'ಹವಾಮಾನ', 'ನೀರು', 'ಬೆಳೆ'] },
  { id: 'fertilizer', label: 'Soil & Fertilizer', keywords: ['fertilizer', 'soil', 'n-p-k', 'urea', 'potash', 'gobbara', 'ಮಣ್ಣು', 'ಗೊಬ್ಬರ', 'ಯೂರಿಯಾ'] }
]

const COMMUNITY_TABS = [
  { id: 'feed',      label: 'Kisan Feed',   icon: MessageSquare },
  { id: 'marketplace', label: 'Buy & Sell', icon: ShoppingCart },
]

export default function Community() {
  const { user } = useUser()
  const { toast } = useToast()
  const _navigate = useNavigate()
  const { selectedDistrict } = useDistrict()
  const [activeTab, setActiveTab] = useState<'feed' | 'marketplace'>('feed')
  const [newPostContent, setNewPostContent] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all')
  const [_suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('all')

  // Feature 6: Crop & Mandi Price Tagging State
  const [selectedCropTag, setSelectedCropTag] = useState('')
  const [mandiPrice, setMandiPrice] = useState('')

  // Feature 4: Polls & Market Sentiment State
  const [isPollActive, setIsPollActive] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])

  const { posts, loading: isFetchingPosts, refetch: fetchPosts } = useCommunityFeed(
    selectedTopic === 'all' ? undefined : selectedTopic,
    'global'
  )

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm']
    },
    onDrop: (acceptedFiles: File[]) => {
      setMediaFiles([...mediaFiles, ...acceptedFiles])
    }
  })

  // Poll for new posts every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const _highlightMatch = (text: string, query: string, caseSensitive = false) => {
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
    const now = Date.now()

    return posts
      .filter(post => {
        if (selectedTopic === 'all') return true
        const topicObj = TOPICS.find(t => t.id === selectedTopic)
        if (!topicObj) return true
        const content = ((post.body || post.content || '') + ' ' + (post.location || '')).toLowerCase()
        return topicObj.keywords.some(keyword => content.includes(keyword))
      })
      .filter(post => {
        if (!query) return true
        const textToSearch = [
          post.body,
          post.content,
          post.location,
          post.crop_tag,
          post.mandi_price,
          post.user?.username,
          post.user?.full_name,
          post.author_name,
          post.author_handle
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return textToSearch.includes(query)
      })
      .filter(post => {
        if (timeFilter === 'all') return true
        if (!post.created_at) return false

        const postTime = new Date(post.created_at).getTime()
        if (isNaN(postTime)) return false

        if (timeFilter === 'day') {
          return postTime >= now - 24 * 60 * 60 * 1000
        }
        if (timeFilter === 'week') {
          return postTime >= now - 7 * 24 * 60 * 60 * 1000
        }
        if (timeFilter === 'month') {
          return postTime >= now - 30 * 24 * 60 * 60 * 1000
        }
        return true
      })
      .sort((a, b) => {
        // Default mode: Recent posts displayed first, going up to any date (like Instagram feed)
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA)
      })
  }, [posts, debouncedQuery, selectedTopic, timeFilter])

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0 && (!isPollActive || !pollQuestion.trim())) return
    setIsLoading(true)
    try {
      const mediaUrls: string[] = []
      if (mediaFiles.length > 0) {
        toast({ title: 'Uploading media...' })
        const urls = await UploadAPI.uploadMultipleMedia(mediaFiles, 'posts')
        mediaUrls.push(...urls)
      }

      let pollData = undefined
      if (isPollActive && pollQuestion.trim()) {
        const validOptions = pollOptions.filter(o => o.trim())
        if (validOptions.length >= 2) {
          pollData = {
            question: pollQuestion.trim(),
            options: validOptions.map((text, idx) => ({
              id: `opt_${idx + 1}`,
              text: text.trim(),
              votes: 0
            })),
            total_votes: 0
          }
        }
      }

      await PostsAPI.createPost({
        user_id: user?.id || '',
        body: newPostContent,
        location: selectedDistrict || '',
        images: mediaUrls,
        crop_tag: selectedCropTag.trim() || undefined,
        mandi_price: mandiPrice.trim() || undefined,
        poll: pollData,
      })

      setNewPostContent('')
      setMediaFiles([])
      setSelectedCropTag('')
      setMandiPrice('')
      setIsPollActive(false)
      setPollQuestion('')
      setPollOptions(['', ''])
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

  // Feature 5: Bookmark toggle
  const handleBookmark = async (postId: string) => {
    try {
      const res = await PostsAPI.toggleBookmark(postId, user?.id);
      fetchPosts()
      toast({
        title: res.bookmarked ? 'Saved to Farm Notebook' : 'Removed from bookmarks',
        description: res.bookmarked ? 'You can view all saved posts on your Profile page.' : undefined
      })
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  // Feature 4: Poll vote
  const handleVotePoll = async (postId: string, optionId: string) => {
    try {
      await PostsAPI.votePoll(postId, optionId, user?.id);
      fetchPosts()
      toast({
        title: 'Vote registered',
        description: 'Thank you for contributing to community market sentiment!'
      })
    } catch (error) {
      console.error('Error voting on poll:', error)
    }
  }

  // Feature 6: Crop tag filter click
  const handleCropTagClick = (cropTag: string) => {
    setSearchQuery(cropTag)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast({
      title: `Filtering by 🌾 ${cropTag}`,
      description: 'Showing all community discussions and mandi prices for this crop.'
    })
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
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto space-y-8">
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
                      <div className="md:col-span-8 relative">
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
                           <button
                             onClick={() => setSearchQuery('')}
                             className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-100/20 hover:text-gold-400 transition-colors"
                             title="Clear search"
                           >
                              <X size={14} />
                           </button>
                        )}
                      </div>
                      <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-earth-border/50 relative flex items-center">
                        <Select
                          value={timeFilter}
                          onValueChange={(val: 'all' | 'day' | 'week' | 'month') => setTimeFilter(val)}
                        >
                          <SelectTrigger className="w-full bg-transparent border-none text-gold-100 h-16 rounded-none px-6 text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:outline-none hover:bg-gold-400/5 transition-colors gap-3">
                            <div className="flex items-center gap-2.5 truncate">
                              <Clock className="h-4 w-4 text-gold-400/60 shrink-0" />
                              <SelectValue placeholder="RECENT (ALL TIME)" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-earth-elevated border-earth-border text-gold-100 z-50">
                            <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider text-gold-100/80 focus:bg-gold-400/10 focus:text-gold-400 cursor-pointer">
                              Recent · All Time
                            </SelectItem>
                            <SelectItem value="day" className="text-xs font-bold uppercase tracking-wider text-gold-100/80 focus:bg-gold-400/10 focus:text-gold-400 cursor-pointer">
                              Last 24 Hours (Last Day)
                            </SelectItem>
                            <SelectItem value="week" className="text-xs font-bold uppercase tracking-wider text-gold-100/80 focus:bg-gold-400/10 focus:text-gold-400 cursor-pointer">
                              Last Week (7 Days)
                            </SelectItem>
                            <SelectItem value="month" className="text-xs font-bold uppercase tracking-wider text-gold-100/80 focus:bg-gold-400/10 focus:text-gold-400 cursor-pointer">
                              Last Month (30 Days)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {timeFilter !== 'all' && (
                          <button
                            onClick={() => setTimeFilter('all')}
                            title="Reset to recent posts"
                            className="absolute right-9 text-gold-100/30 hover:text-gold-400 p-1 rounded-md transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>

                  {timeFilter !== 'all' && (
                    <div className="flex items-center gap-2 mt-2 px-2">
                      <Clock size={11} className="text-gold-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold-100/50">
                        Viewing posts from:{' '}
                        <span className="text-gold-400">
                          {timeFilter === 'day' ? 'Last 24 Hours' : timeFilter === 'week' ? 'Last Week (7 Days)' : 'Last Month (30 Days)'}
                        </span>
                      </span>
                      <button
                        onClick={() => setTimeFilter('all')}
                        className="text-[9px] font-black uppercase tracking-wider text-gold-400/70 hover:text-gold-400 underline ml-2 cursor-pointer transition-colors"
                      >
                        Show All Recent Posts
                      </button>
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
                  <DialogContent className="bg-earth-elevated border-earth-border text-gold-100 sm:max-w-[550px] p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-6 border-b border-earth-border bg-earth-card shrink-0">
                      <DialogTitle className="text-xl font-black tracking-tight text-gold-100 uppercase flex items-center justify-between">
                        <span>Create Community Post</span>
                      </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      <Textarea
                        placeholder="Share harvest updates, mandi rates, questions, or farming tips..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px] bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 rounded-2xl p-4 text-sm placeholder:text-gold-100/20 italic leading-relaxed"
                      />

                      {/* Feature 6: Crop & Mandi Price Tagging */}
                      <div className="p-4 rounded-2xl bg-earth-card/60 border border-earth-border/60 space-y-3">
                        <div className="flex items-center gap-2 text-gold-400 text-xs font-black uppercase tracking-wider">
                          <Tag size={13} />
                          <span>Tag Crop & Mandi Price (Optional)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gold-100/50 uppercase tracking-widest block mb-1">
                              Crop Variety
                            </label>
                            <Input
                              placeholder="e.g. Tomato, Paddy, Onion"
                              value={selectedCropTag}
                              onChange={(e) => setSelectedCropTag(e.target.value)}
                              className="bg-earth-main border-earth-border text-gold-100 text-xs rounded-xl h-10 px-3 placeholder:text-gold-100/20"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gold-100/50 uppercase tracking-widest block mb-1">
                              Mandi Rate / Price
                            </label>
                            <Input
                              placeholder="e.g. ₹2,400 / Qtl"
                              value={mandiPrice}
                              onChange={(e) => setMandiPrice(e.target.value)}
                              className="bg-earth-main border-earth-border text-gold-100 text-xs rounded-xl h-10 px-3 placeholder:text-gold-100/20"
                            />
                          </div>
                        </div>

                        {/* Quick Crop Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] text-gold-100/40 uppercase font-bold mr-1">Quick Picks:</span>
                          {['Tomato', 'Paddy', 'Cotton', 'Ragi', 'Onion', 'Chilli', 'Sugarcane', 'Maize'].map((crop) => (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => setSelectedCropTag(crop)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${
                                selectedCropTag === crop
                                  ? 'bg-gold-400 text-earth-main font-black'
                                  : 'bg-gold-400/5 text-gold-100/60 hover:text-gold-100 hover:bg-gold-400/15 border border-gold-400/10'
                              }`}
                            >
                              {crop}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Feature 4: Interactive Poll & Market Sentiment Creation */}
                      <div className="p-4 rounded-2xl bg-earth-card/60 border border-earth-border/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setIsPollActive(!isPollActive)}
                            className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-xs font-black uppercase tracking-wider transition-colors"
                          >
                            <BarChart2 size={14} />
                            <span>{isPollActive ? 'Poll Attached ✓' : '+ Add Community Poll / Sentiment'}</span>
                          </button>
                          {isPollActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsPollActive(false)
                                setPollQuestion('')
                                setPollOptions(['', ''])
                              }}
                              className="text-[10px] text-red-400/80 hover:text-red-300 font-bold uppercase tracking-wider"
                            >
                              Remove Poll
                            </button>
                          )}
                        </div>

                        {isPollActive && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-[10px] font-bold text-gold-100/50 uppercase tracking-widest block mb-1">
                                Poll Question
                              </label>
                              <Input
                                placeholder="e.g. Expected mandi price for tomato next week?"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="bg-earth-main border-earth-border text-gold-100 text-xs rounded-xl h-10 px-3 placeholder:text-gold-100/20"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gold-100/50 uppercase tracking-widest block">
                                Voting Options (Min 2, Max 4)
                              </label>
                              {pollOptions.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-[10px] text-gold-400/60 font-bold w-4">{idx + 1}.</span>
                                  <Input
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...pollOptions]
                                      next[idx] = e.target.value
                                      setPollOptions(next)
                                    }}
                                    className="bg-earth-main border-earth-border text-gold-100 text-xs rounded-xl h-9 px-3 placeholder:text-gold-100/20 flex-1"
                                  />
                                  {pollOptions.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                      className="text-gold-100/20 hover:text-red-400 p-1 transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {pollOptions.length < 4 && (
                                <button
                                  type="button"
                                  onClick={() => setPollOptions([...pollOptions, ''])}
                                  className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1 hover:text-gold-300 transition-colors"
                                >
                                  <PlusCircle size={12} />
                                  <span>Add Another Option</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dropzone for Media */}
                      <div
                        {...getRootProps()}
                        className="border border-dashed border-gold-400/20 rounded-2xl p-6 text-center cursor-pointer hover:border-gold-400/50 hover:bg-gold-400/5 transition-all group"
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-4">
                            <ImagePlus className="h-6 w-6 text-gold-100/20 group-hover:text-gold-400 transition-all" />
                            <Video className="h-6 w-6 text-gold-100/20 group-hover:text-gold-400 transition-all" />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-100/40 group-hover:text-gold-100 transition-colors">
                            Attach Crop Photos / Videos
                          </p>
                        </div>
                      </div>

                      {mediaFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {mediaFiles.map((file, index) => (
                            <Badge key={index} className="bg-gold-400/10 text-gold-400 border border-gold-400/20 py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest">
                               {file.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 border-t border-earth-border bg-earth-card shrink-0">
                      <Button
                        onClick={handleCreatePost}
                        disabled={isLoading || (!newPostContent.trim() && mediaFiles.length === 0 && (!isPollActive || !pollQuestion.trim()))}
                        className="btn-gold w-full h-14 text-xs font-black uppercase tracking-[0.3em] shadow-gold-glow"
                      >
                        {isLoading ? <Activity className="h-5 w-5 animate-spin" /> : 'Publish to Feed'}
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
                                  crop_tag: post.crop_tag,
                                  mandi_price: post.mandi_price,
                                  poll: post.poll,
                                  user: post.user,
                                  _count: post._count,
                                  isLiked: post.isLiked,
                                  isBookmarked: post.isBookmarked,
                                }}
                                currentUserId={user?.id}
                                onLike={handleLike}
                                onComment={handleComment}
                                onDelete={handleDeletePost}
                                onBookmark={handleBookmark}
                                onVotePoll={handleVotePoll}
                                onCropTagClick={handleCropTagClick}
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
                              setTimeFilter('all')
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
    </div>
  )
}
