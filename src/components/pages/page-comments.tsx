'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Send, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { PageComment } from '@/types/page'

interface PageCommentsProps {
  pageId: string
  comments: PageComment[]
  currentUserId: string
  onAddComment: (content: string, parentId?: string) => void
  onUpdateComment: (id: string, content: string) => void
  onDeleteComment: (id: string) => void
  className?: string
}

interface CommentNodeProps {
  comment: PageComment
  currentUserId: string
  level: number
  onReply: (parentId: string) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
}

function CommentNode({
  comment,
  currentUserId,
  level,
  onReply,
  onUpdate,
  onDelete
}: CommentNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  
  const hasReplies = comment.replies && comment.replies.length > 0
  const isOwn = comment.user_id === currentUserId
  
  const handleUpdate = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onUpdate(comment.id, editContent)
      setIsEditing(false)
    } else {
      setIsEditing(false)
      setEditContent(comment.content)
    }
  }
  
  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id)
      setReplyContent('')
      setShowReplyForm(false)
    }
  }
  
  const getUserInitials = (email?: string) => {
    if (!email) return '??'
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }
  
  return (
    <div className={cn("group", level > 0 && "ml-8")}>
      <div className="flex gap-3">
        {hasReplies && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasReplies && <div className="w-6" />}
        
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">
            {getUserInitials(comment.user_email)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.user_email?.split('@')[0] || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
          
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                Reply
              </Button>
              
              {isOwn && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
          
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {hasReplies && isExpanded && (
        <div className="mt-3 space-y-3">
          {comment.replies!.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              level={level + 1}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PageComments({
  pageId,
  comments,
  currentUserId,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  className
}: PageCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async () => {
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Build comment tree
  const buildCommentTree = (comments: PageComment[]): PageComment[] => {
    const commentMap = new Map<string, PageComment>()
    const rootComments: PageComment[] = []
    
    // First pass: create map and initialize replies
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })
    
    // Second pass: build tree
    comments.forEach(comment => {
      const mappedComment = commentMap.get(comment.id)!
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies!.push(mappedComment)
        } else {
          // Parent not found, treat as root
          rootComments.push(mappedComment)
        }
      } else {
        rootComments.push(mappedComment)
      }
    })
    
    // Sort by created date (newest first)
    const sortComments = (comments: PageComment[]) => {
      comments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      comments.forEach(comment => {
        if (comment.replies && comment.replies.length > 0) {
          sortComments(comment.replies)
        }
      })
    }
    
    sortComments(rootComments)
    
    return rootComments
  }
  
  const commentTree = buildCommentTree(comments)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New comment form */}
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
        
        {/* Comments list */}
        {commentTree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {commentTree.map(comment => (
              <CommentNode
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                level={0}
                onReply={(parentId) => {
                  // This would be handled by the parent component
                  // For now, we'll just use the onAddComment prop
                  onAddComment('', parentId)
                }}
                onUpdate={onUpdateComment}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}