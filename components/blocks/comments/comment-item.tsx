'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MarkdownDisplay } from '@/components/ui/markdown-display';
import { cn } from '@/lib/utils';
import { Comment } from '@/types/comment';
import { User } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { CommentForm } from './comment-form';

// 添加新的 translations 类型接口
interface CommentItemTranslations {
  anonymous_user: string;
  reply_button: string;
  loading_replies: string;
  view_replies: string;
  error_loading_replies: string;
  // 表单翻译
  error_empty_content: string;
  error_empty_name_email: string;
  error_adding_comment: string;
  success_comment_added: string;
  error_comment_failed: string;
  content_label: string;
  content_placeholder: string;
  name_label: string;
  name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  submitting: string;
  submit_button: string;
}

interface CommentItemProps {
  comment: Comment;
  onReplyAdded?: () => void;
  className?: string;
  // 添加 translations 参数
  translations?: CommentItemTranslations;
  user?: User | null;
}

export function CommentItem({
  comment,
  onReplyAdded,
  className,
  user,
  // 使用默认翻译对象
  translations = {
    anonymous_user: '匿名用户',
    reply_button: '回复',
    loading_replies: '加载回复中...',
    view_replies: '查看回复 ({count})',
    error_loading_replies: '加载回复失败',
    // 表单翻译
    error_empty_content: '评论内容不能为空',
    error_empty_name_email: '请填写姓名和电子邮箱',
    error_adding_comment: '添加评论时出错',
    success_comment_added: '评论添加成功',
    error_comment_failed: '评论提交失败',
    content_label: '评论内容',
    content_placeholder: '请输入您的评论',
    name_label: '姓名',
    name_placeholder: '请输入您的姓名',
    email_label: '电子邮箱',
    email_placeholder: '请输入您的电子邮箱',
    submitting: '提交中...',
    submit_button: '提交评论',
  },
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleToggleReplies = async () => {
    if (comment.reply_count && comment.reply_count > 0) {
      if (!showReplies && replies.length === 0) {
        await loadReplies();
      } else {
        setShowReplies(!showReplies);
      }
    }
  };

  const loadReplies = async () => {
    try {
      setIsLoadingReplies(true);
      const response = await fetch(`/api/comments/replies?reply_id=${comment.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setReplies(data.data || []);
        setShowReplies(true);
      }
    } catch (error) {
      console.error(translations.error_loading_replies, error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    loadReplies();
    if (onReplyAdded) {
      onReplyAdded();
    }
  };

  // 生成头像的字母缩写
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // 格式化时间 - 使用英文区域设置
  const formatTime = (time?: string) => {
    if (!time) return '';
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true, locale: enUS });
    } catch (e) {
      return time;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors duration-200">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(comment.name)}</AvatarFallback>
          {comment.avatar_url && <AvatarImage src={comment.avatar_url} alt={comment.name} />}
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">{comment.name || translations.anonymous_user}</div>
            <div className="text-muted-foreground text-sm">{formatTime(comment.created_at)}</div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownDisplay content={comment.content} />
          </div>

          <div className="flex items-center gap-4 mt-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs h-8" onClick={() => setShowReplyForm(!showReplyForm)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              {translations.reply_button}
            </Button>

            {comment.reply_count && comment.reply_count > 0 && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs h-8" onClick={handleToggleReplies} disabled={isLoadingReplies}>
                {isLoadingReplies ? (
                  translations.loading_replies
                ) : (
                  <>
                    {showReplies ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {translations.view_replies.replace('{count}', comment.reply_count.toString())}
                  </>
                )}
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4 pl-4 border-l-2 border-primary/20">
              <CommentForm
                source_code={comment.source_code}
                reply_id={comment.id}
                user={user}
                onSuccess={handleReplySuccess}
                translations={{
                  error_empty_content: translations.error_empty_content,
                  error_empty_name_email: translations.error_empty_name_email,
                  error_adding_comment: translations.error_adding_comment,
                  success_comment_added: translations.success_comment_added,
                  error_comment_failed: translations.error_comment_failed,
                  content_label: translations.content_label,
                  content_placeholder: translations.content_placeholder,
                  name_label: translations.name_label,
                  name_placeholder: translations.name_placeholder,
                  email_label: translations.email_label,
                  email_placeholder: translations.email_placeholder,
                  submitting: translations.submitting,
                  submit_button: translations.submit_button,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="ml-12 space-y-4 border-l-2 border-primary/20 pl-4">
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-4 p-4 rounded-lg bg-card/50 hover:bg-accent/50 transition-colors duration-200">
              <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(reply.name)}</AvatarFallback>
                {reply.avatar_url && <AvatarImage src={reply.avatar_url} alt={reply.name} />}
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-foreground">{reply.name || translations.anonymous_user}</div>
                  <div className="text-muted-foreground text-sm">{formatTime(reply.created_at)}</div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownDisplay content={reply.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
