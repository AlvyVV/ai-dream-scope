'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { DREAM_INPUT_STORAGE_KEY, clearDreamChat, loadDreamChat, saveDreamChat } from '@/lib/chat-storage';
import { cn } from '@/lib/utils';
import { Message, useChat } from '@ai-sdk/react';
import { Image as ImageIcon, Info, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import DreamImageModal from './dream-image-modal';

interface ChatProps {
  initialQuery?: string;
}

// 会话重置标记的key
const NEW_SESSION_FLAG_KEY = 'dreamInterpreterNewSession';

export default function Chat({ initialQuery }: ChatProps) {
  const t = useTranslations('dream');
  const { data: session } = useSession();
  const [currentChatUuid, setCurrentChatUuid] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingUpdateRef = useRef<boolean>(false);
  const messageQueueRef = useRef<Message | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQuerySubmittedRef = useRef<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const previousUserUuidRef = useRef<string | null>(null);
  const chatLoadingAttemptedRef = useRef<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);

  const {
    status,
    messages,
    input,
    handleInputChange,
    setMessages,
    handleSubmit: submitChatMessage,
  } = useChat({
    api: '/api/ai-chat',
  });

  // 判断是否正在等待AI回复
  const isWaitingForResponse = status === 'streaming' || (messages.length > 0 && messages[messages.length - 1].role === 'user');

  // 加载用户的最近聊天记录
  useEffect(() => {
    if (chatLoadingAttemptedRef.current || messages.length > 0 || currentChatUuid) return;

    chatLoadingAttemptedRef.current = true;

    // 检查是否存在新会话标记，如果存在则不加载聊天记录
    try {
      const isNewSession = localStorage.getItem(NEW_SESSION_FLAG_KEY) === 'true';
      if (isNewSession) {
        return;
      }
    } catch (error) {}

    // 首先尝试从本地存储中加载
    const chatData = loadDreamChat();
    if (chatData) {
      setCurrentChatUuid(chatData.uuid);
      setCurrentThreadId(chatData.threadId);
      setMessages(chatData.messages);
      return;
    }

    // 如果本地没有，且用户已登录，尝试从服务器加载
    const userUuid = session?.user?.uuid;
    if (userUuid) {
      loadLatestChatFromServer(userUuid);
    }
  }, [session, status, messages, currentChatUuid, setMessages]);

  // 从服务器加载最近的聊天记录
  const loadLatestChatFromServer = async (userUuid: string) => {
    try {
      setIsLocalLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'get_latest',
          data: {
            user_uuid: userUuid,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const { chat } = await response.json();

      if (chat && chat.uuid && chat.content && chat.content.content) {
        try {
          const contentData = JSON.parse(chat.content.content);
          if (contentData.messages && Array.isArray(contentData.messages) && contentData.messages.length > 0) {
            setCurrentChatUuid(chat.uuid);
            setCurrentThreadId(chat.thread_id);
            setMessages(contentData.messages);
          }
        } catch (e) {}
      } else {
      }
    } catch (error) {
    } finally {
      setIsLocalLoading(false);
    }
  };

  // 保存当前聊天到本地存储
  useEffect(() => {
    if (currentChatUuid && currentThreadId && messages.length > 0) {
      saveDreamChat(currentChatUuid, messages, currentThreadId);
    }
  }, [currentChatUuid, currentThreadId, messages]);

  // 监听用户登录状态，当用户登录后更新聊天记录UUID
  useEffect(() => {
    const userUuid = session?.user?.uuid;

    // 如果用户已登录
    if (userUuid) {
      // 如果存在当前聊天且UUID与用户UUID不同，则更新聊天记录UUID
      if (currentChatUuid && currentChatUuid !== userUuid && userUuid !== previousUserUuidRef.current && currentThreadId) {
        updateChatRecordUuid(currentChatUuid, userUuid, currentThreadId);
      }

      // 更新前一次用户UUID引用
      previousUserUuidRef.current = userUuid;
    }
  }, [session, currentChatUuid, currentThreadId]);

  // 更新聊天记录UUID的函数
  const updateChatRecordUuid = async (oldUuid: string, userUuid: string, threadId: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'update_uuid',
          data: {
            old_uuid: oldUuid,
            new_uuid: userUuid,
            thread_id: threadId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      // 更新本地状态中的UUID
      setCurrentChatUuid(userUuid);
    } catch (error) {}
  };

  // 从本地存储获取输入内容并处理初始查询
  useEffect(() => {
    if (initialQuerySubmittedRef.current || status !== 'ready') return;

    let inputToUse = initialQuery;

    // 如果URL没有提供查询参数，尝试从本地存储获取
    if (!inputToUse) {
      try {
        const storedInput = localStorage.getItem(DREAM_INPUT_STORAGE_KEY);
        if (storedInput) {
          inputToUse = storedInput;
          // 清除本地存储，避免重复加载
          localStorage.removeItem(DREAM_INPUT_STORAGE_KEY);
        }
      } catch (error) {}
    }

    // 如果有输入内容，设置输入框并创建提交动画
    if (inputToUse) {
      // 设置输入框值
      handleInputChange({ target: { value: inputToUse } } as React.ChangeEvent<HTMLTextAreaElement>);

      // 标记已处理，避免重复提交
      initialQuerySubmittedRef.current = true;

      // 添加按钮动画效果，吸引用户注意并点击
      setTimeout(() => {
        setIsPulsing(true);

        // 如果用户10秒内没有点击，停止动画
        setTimeout(() => {
          setIsPulsing(false);
        }, 10000);
      }, 1000);
    }
  }, [initialQuery, status, handleInputChange]);

  // 调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      // 保存当前滚动位置
      const scrollPos = window.scrollY;

      // 调整高度
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;

      // 恢复滚动位置
      window.scrollTo({
        top: scrollPos,
        behavior: 'auto',
      });
    }
  }, [input]);

  // 滚动到最新消息
  useEffect(() => {
    // 只有当有新消息或者正在等待响应时才滚动，不要在用户输入时滚动
    if ((messages.length > 0 && status === 'ready') || isWaitingForResponse) {
      const scrollElement = messagesEndRef.current;
      if (scrollElement) {
        // 使用 requestAnimationFrame 确保在DOM更新后执行滚动
        requestAnimationFrame(() => {
          const scrollArea = scrollElement.closest('.scroll-area-viewport');
          if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
          }
        });
      }
    }
  }, [messages, isWaitingForResponse, status]);

  // 当消息更新时触发
  useEffect(() => {
    if (messages.length > 0 && currentThreadId) {
      const lastMessage = messages[messages.length - 1];

      // 保存最新的消息到队列 - 将消息属性单独保存
      messageQueueRef.current = {
        ...lastMessage,
        // 我们需要保持content为字符串类型，但将其内容设为特殊标记
        content: 'MESSAGES_PLACEHOLDER',
      };
      processQueuedMessages();
    }
  }, [messages, currentThreadId]);

  // 处理排队的消息
  const processQueuedMessages = () => {
    // 如果有排队的消息且当前没有正在执行的更新
    if (messageQueueRef.current && !pendingUpdateRef.current) {
      const now = Date.now();
      const elapsed = now - lastUpdateTimeRef.current;

      // 如果距离上次更新已经超过2秒，直接更新
      if (elapsed >= 2000) {
        const message = messageQueueRef.current;
        messageQueueRef.current = null; // 清空队列
        performUpdate(message);
      } else {
        // 还不到2秒，设置定时器
        const delay = 2000 - elapsed;

        // 清除可能存在的旧定时器
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
        }

        // 设置新的定时器
        updateTimerRef.current = setTimeout(() => {
          if (messageQueueRef.current) {
            const message = messageQueueRef.current;
            messageQueueRef.current = null; // 清空队列
            performUpdate(message);
          }
        }, delay);
      }
    }
  };

  // 真正执行更新操作的函数
  const performUpdate = async (message: Message) => {
    if (!currentThreadId) {
      return;
    }

    // 标记正在执行更新
    pendingUpdateRef.current = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'update',
          data: {
            thread_id: currentThreadId,
            content: {
              // 将消息数组转为JSON字符串，符合后端content期望的字符串类型
              content: JSON.stringify({
                messages: messages,
                timestamp: new Date().toISOString(),
                count: messages.length,
              }),
              metadata: {
                role: message.role,
                id: message.id,
                messageCount: messages.length,
                lastUpdate: new Date().toISOString(),
                threadId: currentThreadId, // 添加线程ID到元数据
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      // 更新成功，记录时间
      lastUpdateTimeRef.current = Date.now();
    } catch (error) {
    } finally {
      // 无论成功失败，都标记为不在执行更新
      pendingUpdateRef.current = false;

      // 检查是否有排队的消息需要处理
      processQueuedMessages();
    }
  };

  // 处理消息提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || status !== 'ready') return;

    // 清除新会话标记
    try {
      localStorage.removeItem(NEW_SESSION_FLAG_KEY);
    } catch (error) {}

    // 立即设置本地加载状态
    setIsLocalLoading(true);

    // 停止按钮动画
    setIsPulsing(false);

    // 如果是新对话，创建新的聊天记录
    if (!currentChatUuid) {
      // 使用用户UUID或生成一个新的UUID作为记录ID
      const userUuid = session?.user?.uuid;
      const newChatUuid = userUuid || uuidv4();
      // 对话线程ID始终使用新生成的UUID，确保其唯一性且与用户无关
      const newThreadId = uuidv4();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'create',
            data: {
              uuid: newChatUuid,
              thread_id: newThreadId, // 使用独立生成的UUID作为thread_id
              content: {
                content: input,
                metadata: {
                  role: 'user',
                },
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }

        setCurrentChatUuid(newChatUuid);
        setCurrentThreadId(newThreadId);
        lastUpdateTimeRef.current = Date.now();
      } catch (error) {}
    }

    try {
      // 提交消息
      await submitChatMessage(e);
    } finally {
      // 无论成功与否，都在一定延迟后关闭本地加载状态
      // 添加一个最小的加载时间，以确保用户能看到加载动画
      setTimeout(() => {
        setIsLocalLoading(false);
      }, 1000);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // 处理清空对话
  const handleClearChat = () => {
    // 确保当前不在加载状态
    if (isLocalLoading || status !== 'ready') return;

    // 临时设置加载状态，防止用户连续点击
    setIsLocalLoading(true);

    // 清空对话状态
    setMessages([]);
    setCurrentChatUuid(null);
    setCurrentThreadId(null); // 重置 thread_id

    // 重置输入框
    handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>);

    // 重置引用状态
    lastUpdateTimeRef.current = 0;
    pendingUpdateRef.current = false;
    messageQueueRef.current = null;
    initialQuerySubmittedRef.current = false;

    // 清除本地存储
    clearDreamChat();

    // 设置新会话标记，防止重新加载
    try {
      localStorage.setItem(NEW_SESSION_FLAG_KEY, 'true');
    } catch (error) {}

    // 重置加载状态引用，允许再次尝试加载新的聊天
    chatLoadingAttemptedRef.current = false;

    // 显示提示消息
    toast.success(t('newChatStarted') || 'Started a new dream interpretation conversation');

    // 关闭加载状态
    setTimeout(() => {
      setIsLocalLoading(false);
    }, 300);
  };

  // 判断是否有梦境描述（第一条用户消息）
  const hasDreamDescription = messages.length > 0 && messages[0].role === 'user';

  // 检查当前对话是否已生成图片
  const checkImageGenerated = useCallback(async (threadId: string) => {
    if (!threadId) return;

    try {
      const response = await fetch(`/api/check-image?threadId=${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setHasGeneratedImage(data.hasImage);
      }
    } catch (error) {
      console.error('检查图片生成状态失败:', error);
    }
  }, []);

  // 获取已生成的图片URL并显示
  const getAndShowExistingImage = async (threadId: string) => {
    try {
      setIsLocalLoading(true);

      const response = await fetch(`/api/get-image?threadId=${threadId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setIsImageModalOpen(true);
        } else {
          toast.error('无法获取图片，请重试');
        }
      } else {
        toast.error('图片获取失败，请重试');
      }
    } catch (error) {
      console.error('获取已生成图片失败:', error);
      toast.error('图片获取失败，请重试');
    } finally {
      setIsLocalLoading(false);
    }
  };

  // 监听threadId变化，检查图片状态
  useEffect(() => {
    if (currentThreadId) {
      checkImageGenerated(currentThreadId);
    } else {
      setHasGeneratedImage(false);
    }
  }, [currentThreadId, checkImageGenerated]);

  // 处理生成梦境图片
  const handleGenerateDreamImage = async () => {
    if (!hasDreamDescription) {
      toast.error('Please describe your dream first.');
      return;
    }

    // 如果已经生成过图片，则获取并显示
    if (hasGeneratedImage && currentThreadId) {
      await getAndShowExistingImage(currentThreadId);
      return;
    }

    console.log('[DEBUG] 开始生成梦境图片，用户输入:', messages[0].content.substring(0, 30) + '...');

    // 设置初始进度值并启动定时器
    setProgressValue(0);
    let currentProgress = 0;

    // 启动进度更新定时器
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      if (currentProgress < 92) {
        // 每秒随机增加2-3%
        const increment = Math.random() * (3 - 2) + 2;
        currentProgress = Math.min(92, currentProgress + increment);
      } else if (currentProgress < 99) {
        // 到达92%后每秒增加1%
        currentProgress = Math.min(99, currentProgress + 1);
      }
      setProgressValue(Math.floor(currentProgress));
    }, 1000);

    try {
      setIsGeneratingImage(true);

      const requestBody = {
        content: messages[0].content,
        thread_id: currentThreadId || '',
      };
      console.log('[DEBUG] 发送请求体:', JSON.stringify(requestBody));

      const response = await fetch('/api/generate-dream-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[DEBUG] API响应状态:', response.status);

      let data;
      try {
        // 尝试直接用response.json()解析
        data = await response.json();
        console.log('[DEBUG] API响应内容:', JSON.stringify(data));
      } catch (e) {
        console.error('[DEBUG] 解析JSON失败:', e);

        // 如果JSON解析失败，尝试获取原始文本
        const text = await response.text().catch(() => 'Unable to retrieve response text');
        console.error('[DEBUG] 原始响应文本:', text);
        toast.error(`Failed to parse API response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        return;
      }

      console.log('[DEBUG] 解析后的响应数据:', data);

      if (!response.ok) {
        const errorMessage = data.error || `API request failed: ${response.status}`;
        console.error('[DEBUG] API请求失败:', errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (data.result) {
        console.log('[DEBUG] 获取到结果:', data.result);

        // 检查返回的结果是否为URL
        const urlPattern = /^(https?:\/\/)[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-_./?=%&]*)?$/;
        if (urlPattern.test(data.result)) {
          console.log('[DEBUG] 结果是有效的URL，准备显示图片');
          setImageUrl(data.result);
          setIsImageModalOpen(true);
          setHasGeneratedImage(true); // 标记已生成图片
        } else {
          console.error('[DEBUG] 结果不是有效的URL:', data.result);
          toast.error(`Failed to generate dream image: ${data.result}`);
        }
      } else {
        console.error('[DEBUG] 响应中没有result字段');
        toast.error('Failed to generate dream image: API response missing result');
      }
    } catch (error) {
      console.error('[DEBUG] 生成梦境图片错误:', error);
      console.error('[DEBUG] 错误堆栈:', error instanceof Error ? error.stack : '未知错误类型');
      toast.error(`Failed to generate dream image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // 无论成功失败，都清除进度定时器和进度值
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      setProgressValue(null);
      setIsGeneratingImage(false);
    }
  };

  return (
    <Card className="flex flex-col w-full bg-background/80 backdrop-blur-sm shadow-lg border-opacity-30 overflow-hidden transition-all duration-300 h-full rounded-b-xl rounded-t-none">
      <CardHeader className="p-3 sm:p-4 border-b shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1 sm:gap-2 w-full">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t('title')}
          </CardTitle>

          {/* 清空对话按钮 - 仅当有对话内容时显示 */}
          {messages.length > 0 && (
            <div className="w-full flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isLocalLoading || status !== 'ready'}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/40 border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('newChat')}</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-2 sm:p-4 overflow-hidden">
        {/* 动画CSS和视口样式 */}
        <style jsx global>{`
          @keyframes attention-pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 20px 10px rgba(124, 58, 237, 0.5);
            }
          }

          @keyframes floating {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes spark {
            0%,
            100% {
              transform: scale(0.8) rotate(0deg);
              opacity: 0.5;
            }
            25% {
              transform: scale(1.2) rotate(90deg);
              opacity: 1;
            }
            50% {
              transform: scale(1) rotate(180deg);
              opacity: 0.8;
            }
            75% {
              transform: scale(1.1) rotate(270deg);
              opacity: 1;
            }
          }

          @keyframes gentle-pulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.03);
            }
          }

          .scroll-area-viewport {
            height: 300px !important;
          }
        `}</style>

        <ScrollArea className="h-[300px] overflow-hidden">
          <div className="flex flex-col h-full relative">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4 text-sm ">
                <p>Please describe your dream in detail, including scenes, characters, emotions, symbols, and possibly related life backgrounds...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto py-4 px-2 sm:px-4">
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((m: Message, index) => (
                    <div key={m.id} className={cn('flex w-full', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] shadow-sm text-sm ',
                          m.role === 'user' ? 'bg-primary text-primary-foreground ml-6 sm:ml-12' : 'bg-muted text-muted-foreground mr-6 sm:mr-12'
                        )}
                      >
                        {m.role !== 'data' && <div className="prose whitespace-pre-wrap text-sm ">{m.content}</div>}
                        {m.role === 'data' && (
                          <div className="space-y-2">
                            <div className="prose text-sm ">{(m.data as any).description}</div>
                            <pre className="bg-muted/50 p-2 rounded-md overflow-x-auto text-xs sm:text-sm">{JSON.stringify(m.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 正在输入的指示器 - 固定显示在底部 */}
                {(isLocalLoading || status === 'streaming') && (
                  <div className="w-full flex justify-start mt-4 sm:mt-6">
                    <div className="bg-muted text-muted-foreground rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] mr-6 sm:mr-12 animate-pulse">
                      <div className="flex space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-0 mt-4" />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-2 sm:pt-3 border-t shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-2 w-full pb-4">
          <Textarea
            ref={textareaRef}
            disabled={isLocalLoading || status !== 'ready'}
            value={input}
            placeholder="Please describe your dream in detail, including scenes, characters, emotions, symbols, and possibly related life backgrounds..."
            onChange={e => {
              // 记录当前滚动位置
              const scrollPos = window.scrollY;

              // 更新输入值
              handleInputChange(e);

              // 调整高度但不影响滚动
              if (e.currentTarget) {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 200)}px`;

                // 恢复滚动位置，防止页面跳动
                window.scrollTo({
                  top: scrollPos,
                  behavior: 'auto',
                });
              }
            }}
            rows={4}
            className="flex-1 resize-none my-2 transition-all focus:shadow-md rounded-xl p-2 sm:p-3 min-h-[120px] text-sm  border-muted-foreground/20"
          />
          <Button
            ref={buttonRef}
            type="submit"
            disabled={isLocalLoading || status !== 'ready'}
            className={cn(
              'w-full rounded-xl transition-all duration-300 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden hover:shadow-xl hover:scale-[1.02] hover:from-purple-500 hover:to-indigo-500 hover:brightness-125 hover:border-purple-300/50',
              isPulsing ? 'animate-[attention-pulse_2s_ease-in-out_infinite]' : ''
            )}
          >
            {isLocalLoading || status === 'streaming' ? (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="font-medium text-xs sm:text-sm">{t('analyzing')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Sparkles className={cn('h-4 w-4 sm:h-5 sm:w-5', isPulsing ? 'animate-[spark_2s_linear_infinite]' : '')} />
                <span className={cn('font-medium text-xs sm:text-sm', isPulsing ? 'animate-[floating_2s_ease-in-out_infinite]' : '')}>{t('analyze')}</span>

                {/* 添加额外的装饰元素，当按钮处于高亮状态时显示 */}
                {isPulsing && (
                  <>
                    <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-purple-300 rounded-full opacity-50 animate-ping"></span>
                    <span className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-indigo-300 rounded-full opacity-50 animate-ping" style={{ animationDelay: '300ms' }}></span>
                  </>
                )}
              </div>
            )}
          </Button>

          <div className="flex flex-col w-full gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDreamImage}
              disabled={!hasDreamDescription || isGeneratingImage || isWaitingForResponse || isLocalLoading}
              className={cn(
                'w-full',
                isGeneratingImage || isWaitingForResponse || isLocalLoading ? 'opacity-50 cursor-not-allowed' : 'animate-[gentle-pulse_2s_ease-in-out_infinite] hover:animate-none transition-all'
              )}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating... {progressValue !== null && `(${progressValue}%)`}
                </>
              ) : hasGeneratedImage ? (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View Your Dream Image
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Your Dream Image for Free
                </>
              )}
            </Button>

            {!hasDreamDescription && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Please describe your dream first to enable image generation.</span>
              </div>
            )}

            {hasGeneratedImage && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Click the button above to view your dream image.</span>
              </div>
            )}
          </div>
        </form>
      </CardFooter>

      {/* 添加梦境图片模态框 */}
      {imageUrl && <DreamImageModal imageUrl={imageUrl} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} />}
    </Card>
  );
}
