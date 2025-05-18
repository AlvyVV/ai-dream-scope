import { Comment } from '@/types/comment';
import { getAdminSupabaseClient } from './db';

interface UserInfo {
  uuid: string;
  nickname: string;
  avatar_url: string;
}

/**
 * 获取指定source_code的顶级评论（不包含回复）
 * @param source_code 评论来源代码
 * @param limit 限制数量
 * @param offset 偏移量，用于分页
 * @returns 评论列表
 */
export async function getTopComments(source_code: string, limit: number = 10, offset: number = 0): Promise<Comment[]> {
  const supabase = await getAdminSupabaseClient();

  // 1. 先获取评论列表
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('source_code', source_code)
    .eq('reply_id', 0)
    .eq('is_deleted', 0)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (commentsError) {
    console.error('获取评论失败:', commentsError);
    return [];
  }

  if (!comments || comments.length === 0) {
    return [];
  }

  // 2. 获取所有相关用户的信息
  const userIds = comments.filter(c => c.user_id).map(c => c.user_id);
  if (userIds.length === 0) {
    return comments;
  }

  const { data: users, error: usersError } = await supabase.from('users').select('uuid, nickname, avatar_url').in('uuid', userIds);

  if (usersError) {
    console.error('获取用户信息失败:', usersError);
    return comments;
  }

  // 3. 合并用户信息到评论中
  const usersMap = new Map((users || []).map((user: UserInfo) => [user.uuid, user]));
  return comments.map(comment => {
    if (comment.user_id) {
      const user = usersMap.get(comment.user_id);
      if (user) {
        return {
          ...comment,
          name: user.nickname,
          avatar_url: user.avatar_url,
        };
      }
    }
    return comment;
  });
}

/**
 * 获取指定评论的回复
 * @param reply_id 被回复的评论ID
 * @returns 回复列表
 */
export async function getCommentReplies(reply_id: number): Promise<Comment[]> {
  const supabase = await getAdminSupabaseClient();

  // 1. 先获取回复列表
  const { data: replies, error: repliesError } = await supabase.from('comments').select('*').eq('reply_id', reply_id).eq('is_deleted', 0).order('created_at', { ascending: true });

  if (repliesError) {
    console.error('获取评论回复失败:', repliesError);
    return [];
  }

  if (!replies || replies.length === 0) {
    return [];
  }

  // 2. 获取所有相关用户的信息
  const userIds = replies.filter(r => r.user_id).map(r => r.user_id);
  if (userIds.length === 0) {
    return replies;
  }

  const { data: users, error: usersError } = await supabase.from('users').select('uuid, nickname, avatar_url').in('uuid', userIds);

  if (usersError) {
    console.error('获取用户信息失败:', usersError);
    return replies;
  }

  // 3. 合并用户信息到回复中
  const usersMap = new Map((users || []).map((user: UserInfo) => [user.uuid, user]));
  return replies.map(reply => {
    if (reply.user_id) {
      const user = usersMap.get(reply.user_id);
      if (user) {
        return {
          ...reply,
          name: user.nickname,
          avatar_url: user.avatar_url,
        };
      }
    }
    return reply;
  });
}

/**
 * 获取指定source_code的评论总数
 * @param source_code 评论来源代码
 * @returns 评论总数
 */
export async function getCommentsCount(source_code: string): Promise<number> {
  const supabase = await getAdminSupabaseClient();
  const { count, error } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('source_code', source_code).eq('reply_id', 0).eq('is_deleted', 0);

  if (error) {
    console.error('获取评论总数失败:', error);
    return 0;
  }

  return count || 0;
}

/**
 * 添加评论
 * @param comment 评论数据
 * @returns 添加的评论数据
 */
export async function addComment(comment: Partial<Comment>) {
  const supabase = await getAdminSupabaseClient();

  // 设置项目ID
  comment.project_id = process.env.PROJECT_ID;

  // 如果是回复，增加原评论的回复计数
  if (comment.reply_id && comment.reply_id > 0) {
    await incrementReplyCount(comment.reply_id);
  }

  const { data, error } = await supabase.from('comments').insert(comment).select();

  if (error) {
    console.error('添加评论失败:', error);
    throw error;
  }

  return data?.[0];
}

/**
 * 增加评论的回复计数
 * @param id 评论ID
 */
async function incrementReplyCount(id: number) {
  const supabase = await getAdminSupabaseClient();

  // 先获取当前回复计数
  const { data } = await supabase.from('comments').select('reply_count').eq('id', id).single();

  if (!data) return;

  // 更新回复计数
  const currentCount = data.reply_count || 0;
  await supabase
    .from('comments')
    .update({ reply_count: currentCount + 1 })
    .eq('id', id);
}
