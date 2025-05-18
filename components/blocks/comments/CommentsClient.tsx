'use client';
// CommentsClient.tsx
// 这是一个纯客户端组件
// @ts-nocheck

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Comment } from '@/types/comment';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';

// 完整的翻译接口
interface CommentsTranslations {
  // 主页面翻译
  commentsTitle: string;
  loadingText: string;
  loadMoreButton: string;
  loadingMoreText: string;
  noCommentsText: string;
  addCommentTitle: string;

  // CommentItem 翻译
  anonymous_user: string;
  reply_button: string;
  loading_replies: string;
  view_replies: string;
  error_loading_replies: string;

  // CommentForm 翻译
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

// 客户端组件，不依赖传递的props
export function CommentsClient() {
  console.log('[CLIENT] CommentsClient 组件初始化');

  // 保存从服务器解析的数据
  const [mounted, setMounted] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 客户端状态
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  // 添加一个本地评论总数状态，用于更准确地显示
  const [commentCount, setCommentCount] = useState(0);

  // 初始化并解析服务器注入的数据
  useEffect(() => {
    try {
      console.log('[CLIENT] CommentsClient 尝试解析数据');

      // 查找数据脚本元素
      const dataScript = document.getElementById('comments-data');
      if (!dataScript) {
        throw new Error('找不到评论数据脚本');
      }

      // 解析数据
      const data = JSON.parse(dataScript.innerHTML);
      console.log('[CLIENT] CommentsClient 数据解析成功', data);

      // 设置所有状态
      setParsedData(data);
      setComments(data.initialComments || []);
      setCommentCount(data.totalComments || 0);
      setHasMore((data.totalComments || 0) > (data.initialComments?.length || 0));
      setMounted(true);
    } catch (err: any) {
      console.error('[CLIENT] CommentsClient 数据解析错误', err);
      setError(err.message || '解析评论数据时出错');
    }
  }, []);

  // 没有成功挂载，显示加载或错误
  if (!mounted) {
    return <div className="p-4 text-center text-gray-500">{error ? `错误: ${error}` : '加载中...'}</div>;
  }

  // 所有函数都是同步的，内部异步
  const loadComments = (source_code: string, offset = 0, limit = 10) => {
    console.log('[CLIENT] 开始加载评论', { offset, limit });
    setLoading(true);

    fetch(`/api/comments/list?source_code=${source_code}&offset=${offset}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if (offset === 0) {
            console.log('[CLIENT] 重置评论列表', { newCount: data.data.comments?.length || 0 });
            setComments(data.data.comments || []);
            // 更新总评论数
            if (data.data.total !== undefined) {
              setCommentCount(data.data.total);
            }
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

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || !parsedData) return;

    console.log('[CLIENT] 加载更多评论');
    setLoadingMore(true);
    const nextPage = page + 1;
    loadComments(parsedData.source_code, comments.length, 10);
    setPage(nextPage);
  };

  const handleCommentAdded = () => {
    console.log('[CLIENT] 评论已添加，重新加载');
    if (!parsedData) return;
    // 评论添加后增加计数
    setCommentCount(prev => prev + 1);
    loadComments(parsedData.source_code, 0, comments.length + 1);
  };

  // 获取所有翻译
  const translations: CommentsTranslations = {
    // 主页面翻译
    commentsTitle: parsedData?.translations?.commentsTitle || '评论',
    loadingText: parsedData?.translations?.loadingText || '加载中...',
    loadMoreButton: parsedData?.translations?.loadMoreButton || '加载更多',
    loadingMoreText: parsedData?.translations?.loadingMoreText || '加载中...',
    noCommentsText: parsedData?.translations?.noCommentsText || '暂无评论',
    addCommentTitle: parsedData?.translations?.addCommentTitle || '添加评论',

    // CommentItem 翻译
    anonymous_user: parsedData?.translations?.anonymous_user || '匿名用户',
    reply_button: parsedData?.translations?.reply_button || '回复',
    loading_replies: parsedData?.translations?.loading_replies || '加载回复中...',
    view_replies: parsedData?.translations?.view_replies || '查看回复 ({count})',
    error_loading_replies: parsedData?.translations?.error_loading_replies || '加载回复失败',

    // CommentForm 翻译
    error_empty_content: parsedData?.translations?.error_empty_content || '评论内容不能为空',
    error_empty_name_email: parsedData?.translations?.error_empty_name_email || '请填写姓名和电子邮箱',
    error_adding_comment: parsedData?.translations?.error_adding_comment || '添加评论时出错',
    success_comment_added: parsedData?.translations?.success_comment_added || '评论添加成功',
    error_comment_failed: parsedData?.translations?.error_comment_failed || '评论提交失败',
    content_label: parsedData?.translations?.content_label || '评论内容',
    content_placeholder: parsedData?.translations?.content_placeholder || '请输入您的评论',
    name_label: parsedData?.translations?.name_label || '姓名',
    name_placeholder: parsedData?.translations?.name_placeholder || '请输入您的姓名',
    email_label: parsedData?.translations?.email_label || '电子邮箱',
    email_placeholder: parsedData?.translations?.email_placeholder || '请输入您的电子邮箱',
    submitting: parsedData?.translations?.submitting || '提交中...',
    submit_button: parsedData?.translations?.submit_button || '提交评论',
  };

  return (
    <div className={cn('w-full space-y-8', parsedData?.className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{translations.commentsTitle}</h2>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{commentCount}</span>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReplyAdded={handleCommentAdded} translations={translations} user={parsedData?.user} />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore} className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translations.loadingMoreText}
                  </>
                ) : (
                  translations.loadMoreButton
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg bg-card/50">
          <div className="text-muted-foreground">{loading ? translations.loadingText : translations.noCommentsText}</div>
        </div>
      )}

      <div className="border-t pt-8">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{translations.addCommentTitle}</h3>
        </div>
        <div className="rounded-lg bg-card/50 p-6">
          <CommentForm source_code={parsedData?.source_code} user={parsedData?.user} onSuccess={handleCommentAdded} translations={translations} />
        </div>
      </div>
    </div>
  );
}
