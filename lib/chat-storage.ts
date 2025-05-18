export const DREAM_INPUT_STORAGE_KEY = 'dreamInterpreterInput';
export const DREAM_CHAT_STORAGE_KEY = 'dreamInterpreterChat';

/**
 * 清除所有梦境解析相关的本地存储
 */
export function clearDreamChat(): void {
  try {
    localStorage.removeItem(DREAM_CHAT_STORAGE_KEY);
    localStorage.removeItem(DREAM_INPUT_STORAGE_KEY);
    console.log('[DEBUG] 已清空聊天记录存储');
  } catch (error) {
    console.error('清空本地存储失败:', error);
  }
}

/**
 * 保存聊天记录到本地存储
 */
export function saveDreamChat(chatUuid: string, messages: any[], threadId: string): void {
  try {
    if (!chatUuid || !threadId || !messages || messages.length === 0) {
      return;
    }

    const chatData = {
      uuid: chatUuid,
      threadId: threadId,
      messages: messages,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(DREAM_CHAT_STORAGE_KEY, JSON.stringify(chatData));
    console.log('[DEBUG] 聊天记录已保存到本地存储');
  } catch (error) {
    console.error('保存聊天记录到本地存储失败:', error);
  }
}

/**
 * 从本地存储中加载聊天记录
 */
export function loadDreamChat(): { uuid: string; messages: any[]; threadId: string } | null {
  try {
    const savedChat = localStorage.getItem(DREAM_CHAT_STORAGE_KEY);
    if (savedChat) {
      const chatData = JSON.parse(savedChat);
      if (chatData.uuid && chatData.messages && Array.isArray(chatData.messages) && chatData.messages.length > 0) {
        return {
          uuid: chatData.uuid,
          messages: chatData.messages,
          threadId: chatData.threadId || chatData.uuid, // 向后兼容，如果没有 threadId 则使用 uuid
        };
      }
    }
    return null;
  } catch (error) {
    console.error('从本地存储加载聊天记录失败:', error);
    return null;
  }
}
