import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { Button } from './button'
import { Card } from './card'
import { Textarea } from './textarea'
import { format } from 'date-fns'
import { Heart, MessageCircle, Share2, MoreVertical, Loader2, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { PostsAPI, Comment } from '@/lib/api/posts'

interface PostCardProps {
  post: {
    id: string
    content: string
    kn_caption?: string | null
    images?: string[]
    video_url?: string | null
    location?: string
    created_at: string
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
  }
  onLike?: (postId: string) => void
  onComment?: (postId: string, content: string) => void
  onShare?: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
}

export const PostCard = React.memo(function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onDelete,
  currentUserId,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isCommenting) {
      setIsLoadingComments(true)
      PostsAPI.getComments(post.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setIsLoadingComments(false))
    }
  }, [isCommenting, post.id])

  const handleLike = () => {
    onLike?.(post.id)
  }

  const handleComment = async () => {
    if (!commentContent.trim()) return
    setIsSubmitting(true)
    const tempContent = commentContent
    try {
      await onComment?.(post.id, tempContent)
      setCommentContent('')
      // Re-fetch comments to display the newly posted one
      const updatedComments = await PostsAPI.getComments(post.id)
      setComments(updatedComments)
    } catch (error) {
       console.error("Comment failed", error);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = () => {
    onShare?.(post.id)
    toast({
      title: 'Transmission Link Encrypted',
      description: 'The post identifier has been copied to your clipboard.',
    })
  }

  return (
    <Card className="card-premium border-none shadow-premium mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <button className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (post.user?.id) navigate(`/profile/${post.user.id}`); }}>
            <Avatar className="h-10 w-10 border border-gold-400/20">
              <AvatarImage src={post.user?.avatar_url} />
              <AvatarFallback className="bg-gold-400/10 text-gold-400 font-bold">{((post.user?.username || post.user?.full_name || 'Farmer')[0] || 'F').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                 <p className="font-black text-gold-100 uppercase tracking-tight text-sm">{post.user?.full_name || post.user?.username || 'Farmer'}</p>
                 {post.location && (
                   <span className="flex items-center text-[10px] text-gold-400/60 font-bold uppercase tracking-tighter bg-gold-400/5 px-2 py-0.5 rounded-full border border-gold-400/10">
                     <MapPin size={8} className="mr-1" /> {post.location}
                   </span>
                 )}
              </div>
              <p className="text-[10px] font-bold text-gold-100/30 uppercase tracking-widest mt-0.5">
                {post.created_at ? format(new Date(post.created_at), 'MMMM dd, yyyy') : 'Recently'}
              </p>
            </div>
          </button>
          {currentUserId === post.user?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gold-100/40 hover:text-gold-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-earth-elevated border-earth-border">
                <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                  Delete Transmission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gold-100/90 leading-relaxed font-medium italic">"{post.content}"</p>
          {post.kn_caption && (
            <div className="mt-4 p-3 bg-gold-400/5 rounded-xl border border-gold-400/10">
               <p className="text-xs text-gold-400/80 leading-relaxed font-bold">{post.kn_caption}</p>
            </div>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="grid gap-3 mb-6">
            {post.images.map((image, index) => (
              <div key={index} className="rounded-2xl overflow-hidden border border-earth-border shadow-inner">
                <img
                  src={image}
                  alt={`Transmission Visual ${index + 1}`}
                  className="max-h-96 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            ))}
          </div>
        )}

        {post.video_url && (
          <div className="rounded-2xl overflow-hidden border border-earth-border mb-6">
             <video
               src={post.video_url}
               controls
               className="max-h-96 w-full object-cover"
             />
          </div>
        )}

        <div className="flex items-center gap-6 text-gold-100/40 pt-4 border-t border-earth-border/50">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${post.isLiked ? 'text-red-400' : 'hover:text-gold-400'}`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            {post._count?.likes || 0} <span className="hidden sm:inline">Reactions</span>
          </button>
          
          <button 
            onClick={() => setIsCommenting(!isCommenting)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-gold-400 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            {post._count?.comments || 0} <span className="hidden sm:inline">Comments</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-gold-400 transition-all ml-auto"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <AnimatePresence>
          {isCommenting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-6"
            >
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 p-4 bg-earth-elevated/40 rounded-2xl border border-earth-border/50"
                    >
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (comment.user?.id) navigate(`/profile/${comment.user.id}`); }} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                        <Avatar className="h-8 w-8 border border-gold-400/10">
                          <AvatarImage src={comment.user?.avatar_url} />
                          <AvatarFallback className="bg-gold-400/5 text-gold-400 text-[10px] font-black">{((comment.user?.username || comment.user?.full_name || 'F')[0] || 'F').toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (comment.user?.id) navigate(`/profile/${comment.user.id}`); }} className="font-black text-[10px] text-gold-100 uppercase tracking-tighter hover:text-gold-400">
                            {comment.user?.full_name || comment.user?.username || 'Farmer'}
                          </button>
                          <span className="text-[9px] font-bold text-gold-100/20 uppercase tracking-widest">{comment.created_at ? format(new Date(comment.created_at), 'MMM d') : 'Recently'}</span>
                        </div>
                        <p className="text-xs text-gold-100/60 leading-relaxed">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[10px] text-gold-100/20 text-center italic font-bold uppercase tracking-widest py-4">No comments yet. Be the first to comment.</p>
                )}
              </div>
 
              <div className="flex flex-col gap-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="bg-earth-main border-earth-border focus:border-gold-400 text-gold-100 text-xs min-h-[80px] rounded-xl placeholder:text-gold-100/20"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-gold-100/40" onClick={() => setIsCommenting(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={handleComment} 
                    disabled={isSubmitting || !commentContent.trim()}
                    className="btn-gold px-6 h-9 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
})
