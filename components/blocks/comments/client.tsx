'use client';
// 这是一个明确的客户端组件

import { useState } from 'react';
import { Comment } from '@/types/comment';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// 使用紧凑的类型定义
interface ClientCommentsProps {
  source_code: string;
  initialComments: Comment[];
  totalComments: number;
  user?: any;
  className?: string;
  translations: {
    commentsTitle: string;
    loadingText: string;
    loadMoreButton: string;
    loadingMoreText: string;
    noCommentsText: string;
    addCommentTitle: string;
  };
}

// 导出简单的客户端组件
export function ClientComments(props: ClientCommentsProps) {
  const { source_code, initialComments, totalComments, user, className, translations } = props;

  // 使用同步初始化，避免客户端暂停
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(totalComments > initialComments.length);
  const [page, setPage] = useState(1);

  const {
    commentsTitle,
    loadingText,
    loadMoreButton,
    loadingMoreText,
    noCommentsText,
    addCommentTitle,
  } = translations;

  // 同步函数，只有内部是异步的
  const loadComments = (offset = 0, limit = 10) => {
    console.log('[CLIENT] 开始加载评论', { offset, limit });
    setLoading(true);

    // 异步操作包装在同步函数中
    fetch(`/api/comments/list?source_code=${source_code}&offset=${offset}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if (offset === 0) {
            console.log('[CLIENT] 重置评论列表', { newCount: data.data.comments?.length || 0 });
            setComments(data.data.comments || []);
          } else {
            console.log('[CLIENT] 追加评论列表', { appendCount: data.data.comments?.length || 0 });
            setComments(prev => [...prev, ...(data.data.comments || [])]);
          }
          setHasMore(data.data.hasMore);
        } else {
          console.log('[CLIENT] 评论加载失败', { data });
        }
      })
      .catch(error => {
        console.error('[CLIENT] 评论加载错误', error);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  // 同步事件处理函数
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;

    console.log('[CLIENT] 加载更多评论');
    setLoadingMore(true);
    const nextPage = page + 1;
    loadComments(comments.length, 10);
    setPage(nextPage);
  };

  // 同步事件处理函数
  const handleCommentAdded = () => {
    console.log('[CLIENT] 评论已添加，重新加载');
    loadComments(0, comments.length + 1);
  };

  // 简单的同步渲染
  return (
    <div className={cn('w-full', className)}>
      <h2 className="text-2xl font-bold mb-6">
        {commentsTitle} ({totalComments})
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-8 mb-8">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReplyAdded={handleCommentAdded} />
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingMoreText}
                  </>
                ) : (
                  loadMoreButton
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {loading ? loadingText : noCommentsText}
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">{addCommentTitle}</h3>
        <CommentForm source_code={source_code} user={user} onSuccess={handleCommentAdded} />
      </div>
    </div>
  );
}
