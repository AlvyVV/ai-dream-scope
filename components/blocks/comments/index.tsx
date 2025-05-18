import { getCommentsCount, getTopComments } from '@/models/comment';
import { getUserInfo } from '@/services/user';
import { Comment } from '@/types/comment';
import { User } from '@/types/user';
import { getTranslations } from 'next-intl/server';
import { CommentsMountScript } from './comments-mount';

interface CommentsProps {
  source_code?: string;
  initialComments?: Comment[];
  totalComments?: number;
  user?: User;
  className?: string;
}

// 默认导出服务器组件
export default async function Comments(props: CommentsProps) {
  // 获取翻译文本
  const t = await getTranslations('comments');

  // 如果没有提供初始数据，则在服务端获取
  let comments = props.initialComments;
  let total = props.totalComments;

  // 主动获取用户信息
  let currentUser = props.user;
  if (!currentUser) {
    currentUser = await getUserInfo();
  }

  if (!comments || !total) {
    comments = await getTopComments(props.source_code || '', 10, 0);
    total = await getCommentsCount(props.source_code || '');
  }

  // 创建数据对象
  const commentsData = {
    source_code: props.source_code,
    initialComments: comments || [],
    totalComments: total || 0,
    user: currentUser
      ? {
          id: currentUser.id,
          uuid: currentUser.uuid,
          email: currentUser.email,
          nickname: currentUser.nickname,
          avatar_url: currentUser.avatar_url,
        }
      : null,
    className: props.className,
    translations: {
      // 主页面翻译
      commentsTitle: t('title'),
      loadingText: t('loading'),
      loadMoreButton: t('load_more'),
      loadingMoreText: t('loading_more'),
      noCommentsText: t('no_comments'),
      addCommentTitle: t('add_comment_title'),

      // CommentItem 翻译
      anonymous_user: t('anonymous_user'),
      reply_button: t('reply_button'),
      loading_replies: t('loading_replies'),
      view_replies: t('view_replies', { count: '{count}' }),
      error_loading_replies: t('error_loading_replies'),

      // CommentForm 翻译
      error_empty_content: t('error_empty_content'),
      error_empty_name_email: t('error_empty_name_email'),
      error_adding_comment: t('error_adding_comment'),
      success_comment_added: t('success_comment_added'),
      error_comment_failed: t('error_comment_failed'),
      content_label: t('content_label'),
      content_placeholder: t('content_placeholder'),
      name_label: t('name_label'),
      name_placeholder: t('name_placeholder'),
      email_label: t('email_label'),
      email_placeholder: t('email_placeholder'),
      submitting: t('submitting'),
      submit_button: t('submit_button'),
    },
  };

  // 序列化数据
  const serializedData = JSON.stringify(commentsData);

  // 返回HTML结构，包含数据和挂载脚本
  return (
    <>
      <div id="comments-container" className={props.className} data-comments-source={props.source_code} data-comments-total={total}>
        <script
          id="comments-data"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: serializedData,
          }}
        />
        <div id="comments-mount-point" className="comments-component">
          <div className="p-4 text-center text-gray-500">{t('loading')}...</div>
        </div>
      </div>
      <CommentsMountScript />
    </>
  );
}

// 服务端加载评论数据的辅助函数
export async function getCommentsData(source_code: string) {
  // 在服务端获取前10条评论和总数
  const initialComments = await getTopComments(source_code, 10, 0);
  const totalComments = await getCommentsCount(source_code);

  // 不自动获取用户信息
  const user = await getUserInfo();

  return {
    initialComments,
    totalComments,
    user,
  };
}
