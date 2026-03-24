'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageSquare, Reply, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getCommentsAction,
  createCommentAction,
  deleteCommentAction,
} from '@/app/learn/actions'

interface Comment {
  id: string
  body: string
  createdAt: Date
  user: { id: string; name: string | null; image: string | null }
  replies: Array<{
    id: string
    body: string
    createdAt: Date
    user: { id: string; name: string | null; image: string | null }
  }>
}

interface DiscussionTabProps {
  lessonId: string
  currentUserId: string
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function CommentInput({
  onSubmit,
  placeholder,
  autoFocus,
  onCancel,
}: {
  onSubmit: (body: string) => Promise<void>
  placeholder: string
  autoFocus?: boolean
  onCancel?: () => void
}) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    await onSubmit(body.trim())
    setBody('')
    setSubmitting(false)
  }

  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit()
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Presiona <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Ctrl</kbd>+<kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd> para enviar
          </p>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              size="sm"
              disabled={!body.trim() || submitting}
              onClick={handleSubmit}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Comentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  currentUserId,
  lessonId,
  onRefresh,
  isReply,
}: {
  comment: Comment | Comment['replies'][0]
  currentUserId: string
  lessonId: string
  onRefresh: () => void
  isReply?: boolean
}) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const isOwn = comment.user.id === currentUserId

  const handleReply = async (body: string) => {
    await createCommentAction(lessonId, body, comment.id)
    setShowReplyInput(false)
    onRefresh()
  }

  const handleDelete = async () => {
    await deleteCommentAction(comment.id)
    onRefresh()
  }

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.image || undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(comment.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.user.name || 'Usuario'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
        <div className="mt-1.5 flex items-center gap-3">
          {!isReply && (
            <button
              onClick={() => setShowReplyInput((p) => !p)}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Reply className="h-3.5 w-3.5" />
              Responder
            </button>
          )}
          {isOwn && (
            <button
              onClick={handleDelete}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-3">
            <CommentInput
              onSubmit={handleReply}
              placeholder="Escribe una respuesta..."
              autoFocus
              onCancel={() => setShowReplyInput(false)}
            />
          </div>
        )}

        {/* Replies */}
        {'replies' in comment &&
          (comment as Comment).replies.map((reply) => (
            <div key={reply.id} className="mt-3">
              <CommentItem
                comment={reply}
                currentUserId={currentUserId}
                lessonId={lessonId}
                onRefresh={onRefresh}
                isReply
              />
            </div>
          ))}
      </div>
    </div>
  )
}

export function DiscussionTab({ lessonId, currentUserId }: DiscussionTabProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const loadComments = useCallback(async () => {
    const result = await getCommentsAction(lessonId)
    if (result.success && result.data) {
      setComments(result.data.comments)
    }
    setLoading(false)
  }, [lessonId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleNewComment = async (body: string) => {
    await createCommentAction(lessonId, body)
    loadComments()
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Cargando comentarios...
      </div>
    )
  }

  return (
    <div>
      {/* New comment */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" />
          Participa en la discusión
        </h3>
        <CommentInput
          onSubmit={handleNewComment}
          placeholder="Comparte tus ideas, haz una pregunta o ayuda a otros a entender..."
        />
      </div>

      {/* Comments list */}
      <div className="border-t pt-4">
        <h3 className="mb-4 text-sm font-semibold">
          {comments.length} {comments.length === 1 ? 'Comentario' : 'Comentarios'}
        </h3>

        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sé el primero en comentar en esta lección.
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                lessonId={lessonId}
                onRefresh={loadComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
