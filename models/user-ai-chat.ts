import { UserAiChat } from '@/types/user-ai-chat';
import { getAdminSupabaseClient } from './db';

export enum UserAiChatStatus {
  Active = 1,
  Archived = 0,
}

export async function insertUserAiChat(chat: UserAiChat) {
  chat.project_id = process.env.PROJECT_ID;
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').insert(chat);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserAiChaImage(threadId: string, image_url: string) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').update({ image_url }).eq('thread_id', threadId);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserAiChat(threadId: string, chat: Partial<UserAiChat>) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').update(chat).eq('thread_id', threadId);

  if (error) {
    throw error;
  }

  return data;
}

export async function findUserAiChatByUuid(uuid: string): Promise<UserAiChat | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').select('*').eq('uuid', uuid).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findUserAiChatsByThreadId(threadId: string): Promise<UserAiChat[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return data;
}

export async function findUserAiChatsByAssistantId(assistantId: string): Promise<UserAiChat[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').select('*').eq('assistant_id', assistantId).order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function getAllUserAiChats(page: number = 1, limit: number = 50): Promise<UserAiChat[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('user_ai_chat')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function deleteUserAiChat(uuid: string) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').delete().eq('uuid', uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUserAiChatsByThreadId(threadId: string) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').delete().eq('thread_id', threadId);

  if (error) {
    throw error;
  }

  return data;
}

export async function findLatestUserAiChatByUserUuid(userUuid: string): Promise<UserAiChat | undefined> {
  const supabase = await getAdminSupabaseClient();

  // 通过 uuid 查询最新的聊天记录
  let { data, error } = await supabase.from('user_ai_chat').select('*').eq('uuid', userUuid).order('created_at', { ascending: false }).limit(1).single();

  if (!error && data) {
    return data;
  }

  // 如果通过 uuid 没有找到，则返回 undefined
  // 不再尝试通过 thread_id 查询，因为 thread_id 和 uuid 现在是完全独立的概念
  return undefined;
}

export async function updateUserAiChatUuid(threadId: string, newUuid: string) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').update({ uuid: newUuid }).eq('thread_id', threadId);

  if (error) {
    throw error;
  }

  return data;
}

export async function checkThreadHasImage(threadId: string): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').select('image_url').eq('thread_id', threadId).single();

  if (error || !data) {
    return false;
  }

  return !!data.image_url;
}

export async function getThreadImageUrl(threadId: string): Promise<string | null> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('user_ai_chat').select('image_url').eq('thread_id', threadId).single();

  if (error || !data || !data.image_url) {
    return null;
  }

  return data.image_url;
}
