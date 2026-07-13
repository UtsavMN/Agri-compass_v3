import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/store';
import { PostsAPI, Comment } from '@/lib/api/posts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { MessageCircle, Send } from 'lucide-react'
import { format } from 'date-fns'

interface CommentSectionProps {
  postId: string
  commentsCount: number
  onCommentsCountChange: (count: number) => void
}

export default function CommentSection({ postId, commentsCount, onCommentsCountChange }: CommentSectionProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [isExpanded, comments.length])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await PostsAPI.getComments(postId)
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast({
        title: 'Error loading comments',
        description: 'Failed to load comments',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      setIsSubmitting(true)
      const comment = await PostsAPI.addComment(postId, user.id, newComment.trim())
      setComments(prev => [...prev, comment])
      setNewComment('')
      onCommentsCountChange(commentsCount + 1)

      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: 'Error adding comment',
        description: 'Failed to add your comment',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  return (
    <div className="space-y-4">
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <MessageCircle className="h-4 w-4" />
        {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
        {isExpanded ? ' (hide)' : ' (show)'}
      </Button>

      {/* Comments List */}
      {isExpanded && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => navigate(`/profile/${comment.user.id}`)}
                  >
                    <AvatarImage src={comment.user.avatar_url} />
                    <AvatarFallback>
                      {comment.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user.full_name || comment.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </>
          )}

          {/* Add Comment */}
          {user && (
            <div className="flex gap-3">
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/profile/${user?.id}`)}
              >
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
