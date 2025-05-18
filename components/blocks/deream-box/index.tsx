'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// 定义本地存储键
const DREAM_INPUT_STORAGE_KEY = 'dreamInterpreterInput';

// 定义消息行组件
function MessageRow({ children, isEven }: { children: React.ReactNode; isEven: boolean }) {
  return (
    <div className="group relative h-16 overflow-visible">
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-primary/10 from-[2px] to-[2px] bg-[length:12px_100%]" />
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/5 from-[2px] to-[2px] bg-[length:12px_100%] group-last:hidden" />
      {children}
    </div>
  );
}

// 定义消息项接口
interface MessageItem {
  text: string;
  link: string;
}

// 定义消息组件
function Message({
  messageItem,
  isEven,
  delay,
  duration,
  rowIsEven,
  position = 'top',
  onClick,
}: {
  messageItem: MessageItem;
  isEven: boolean;
  delay: string;
  duration: string;
  rowIsEven: boolean;
  position?: 'top' | 'bottom';
  onClick: (text: string) => void;
}) {
  // 动画方向和位置参数
  const direction = rowIsEven ? 'right' : 'left';

  // 根据方向设置动画类名
  const animationDirection = direction === 'right' ? '[--move-x-from:-120%] [--move-x-to:120%] [animation-name:move-x]' : '[--move-x-from:120%] [--move-x-to:-120%] [animation-name:move-x-reverse]';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(messageItem.text);
    window.location.href = messageItem.link;
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'absolute grid grid-cols-[auto] items-center whitespace-nowrap px-3 py-1 z-10 cursor-pointer hover:scale-105 transition-transform',
        isEven ? 'rounded-full bg-gradient-to-t from-muted from-50% to-muted/80 text-muted-foreground' : 'rounded-full bg-gradient-to-t from-primary/80 from-50% to-primary/60 text-primary-foreground',
        '[animation-iteration-count:infinite] [animation-timing-function:linear]',
        animationDirection,
        position === 'top' ? 'top-2' : 'top-9'
      )}
      style={{
        animationDuration: duration,
        animationDelay: delay,
      }}
    >
      <span className="text-xs font-medium">{messageItem.text}</span>
    </div>
  );
}

interface DreamBoxProps {
  title?: string;
  initialMessages?: MessageItem[];
  onSubmit?: (message: string) => void;
  buttonText?: string;
  placeholderText?: string;
}

export default function DreamBox({
  title = 'Dream Box',
  initialMessages = [
    { text: 'What does it mean when you dream about someone​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about snakes​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about your ex​', link: '/dream-interpreter#chat-section' },
    { text: 'What does teeth falling out in a dream mean​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about being pregnant​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about falling​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about water​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about being chased​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about flying​', link: '/dream-interpreter#chat-section' },
    { text: 'What does it mean when you dream about death​', link: '/dream-interpreter#chat-section' },
  ],
  onSubmit,
  buttonText = 'Interpret your dream Now',
  placeholderText = 'Enter your dream about ... Sea, Snake, Death, Ex, Flying, Pregnant, Falling, Chased, Death',
}: DreamBoxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLogoRotating, setIsLogoRotating] = useState(false);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 使用延迟加载初始化消息，以减少初始页面加载时间
  useEffect(() => {
    // 在组件完全挂载后再加载消息动画
    let mounted = true;
    if (mounted && !isAnimationLoaded) {
      // 使用requestIdleCallback或setTimeout在浏览器空闲时加载动画
      const loadAnimations = () => {
        setMessages(initialMessages);
        setIsAnimationLoaded(true);
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          if (mounted) loadAnimations();
        });
      } else {
        setTimeout(() => {
          if (mounted) loadAnimations();
        }, 1000); // 延迟1秒加载动画
      }
    }

    return () => {
      mounted = false;
    };
  }, [initialMessages, isAnimationLoaded]);

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // 添加用户消息
    const newMessage: MessageItem = {
      text: input,
      link: '/dream-interpreter#chat-section',
    };
    setMessages(prev => [...prev, newMessage]);

    // 调用外部提交处理函数
    if (onSubmit) {
      try {
        await onSubmit(input);
      } catch (error) {
        console.error('Error submitting message:', error);
      }
    }

    // 将输入存储到本地存储
    try {
      localStorage.setItem(DREAM_INPUT_STORAGE_KEY, input);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // 跳转到解梦页面并定位到特定部分
    router.push('/dream-interpreter#chat-section');

    setIsSubmitting(false);
    setInput('');

    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // 处理Logo悬停
  const handleLogoEnter = () => {
    setIsLogoHovered(true);
    setIsLogoRotating(true);

    // 旋转一圈后停止
    setTimeout(() => {
      setIsLogoRotating(false);
    }, 1000); // 1秒完成一圈旋转
  };

  const handleLogoLeave = () => {
    setIsLogoHovered(false);
  };

  // 生成行的动画参数 - 每行使用相同的速度
  const generateRowAnimationParams = (rowIndex: number) => {
    // 基于行索引生成15-22秒范围内的持续时间
    const rowDuration = 15 + (rowIndex % 5) * 1.4; // 确保在15-22秒范围内

    // 生成随机延迟，避免所有行同时开始
    const baseDelay = rowIndex * 3;

    return {
      duration: `${rowDuration}s`,
      baseDelay,
    };
  };

  // 创建行组，每行显示1-2条消息
  const createMessageRows = useCallback(() => {
    // 如果动画还没加载，返回空数组
    if (!isAnimationLoaded) return [];

    const rows = [];
    let rowIndex = 0;
    let i = 0;

    while (i < Math.min(messages.length, 15) && rowIndex < 5) {
      const rowIsEven = rowIndex % 2 === 0;

      const rowMessages = [];

      // 为每行生成统一的动画参数
      const { duration, baseDelay } = generateRowAnimationParams(rowIndex);

      // 为当前行添加第一条消息
      if (i < messages.length) {
        rowMessages.push({
          messageItem: messages[i],
          index: i,
          isEven: i % 2 === 0,
          position: 'top' as const,
          duration,
          delay: `-${baseDelay}s`,
        });
        i++;
      }

      // 尝试为当前行添加第二条消息（如果有的话）
      if (i < messages.length) {
        rowMessages.push({
          messageItem: messages[i],
          index: i,
          isEven: i % 2 === 0,
          position: 'bottom' as const,
          duration, // 使用相同的持续时间
          delay: `-${baseDelay + 10}s`, // 在基础延迟上加10秒，确保两条消息错开显示
        });
        i++;
      }

      rows.push({
        rowIndex,
        rowIsEven,
        messages: rowMessages,
      });

      rowIndex++;
    }

    return rows;
  }, [messages, isAnimationLoaded]);

  const messageRows = createMessageRows();

  // 处理预设消息的点击
  const handlePresetClick = (text: string) => {
    try {
      localStorage.setItem(DREAM_INPUT_STORAGE_KEY, text);
    } catch (error) {
      console.error('Error saving preset to localStorage:', error);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] w-full bg-background/80 backdrop-blur-sm shadow-lg border-opacity-30 overflow-hidden">
      <CardHeader className="p-3 border-b">
        <CardTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-3 overflow-hidden">
        {/* 滚动动画的CSS */}
        <style jsx global>{`
          @keyframes move-x {
            0% {
              transform: translateX(var(--move-x-from));
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              transform: translateX(var(--move-x-to));
              opacity: 0;
            }
          }

          @keyframes move-x-reverse {
            0% {
              transform: translateX(var(--move-x-from));
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              transform: translateX(var(--move-x-to));
              opacity: 0;
            }
          }

          @keyframes pulse-glow {
            0%,
            100% {
              opacity: 0.7;
              transform: scale(1);
            }
            50% {
              opacity: 0.9;
              transform: scale(1.05);
            }
          }

          @keyframes spin-once {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes logo-glow {
            0% {
              box-shadow: 0 0 5px 0px rgba(var(--primary), 0.5);
            }
            50% {
              box-shadow: 0 0 15px 5px rgba(var(--primary), 0.7);
            }
            100% {
              box-shadow: 0 0 5px 0px rgba(var(--primary), 0.5);
            }
          }
        `}</style>

        <div className="h-full flex flex-col justify-start overflow-visible relative">
          {/* 中央Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative" onMouseEnter={handleLogoEnter} onMouseLeave={handleLogoLeave}>
              {/* 毛玻璃背景效果 */}
              <div
                className={`absolute inset-0 -m-6 rounded-full bg-background/30 backdrop-blur-md shadow-lg ${
                  isLogoHovered ? 'animate-[logo-glow_1.5s_ease-in-out_infinite]' : 'animate-[pulse-glow_4s_ease-in-out_infinite]'
                }`}
              />

              {/* Logo容器 */}
              <div
                className={`relative size-20 rounded-full overflow-hidden p-2 flex items-center justify-center bg-gradient-to-b ${
                  isLogoHovered ? 'from-white/80 to-white/40 scale-110' : 'from-white/20 to-white/5'
                } shadow-[inset_0_0_10px_rgba(255,255,255,0.3)] z-30 transition-all duration-300 cursor-pointer`}
                onClick={() => {
                  window.location.href = '/dream-interpreter#chat-section';
                }}
              >
                <Image
                  src="/logo.webp"
                  alt="Logo"
                  width={60}
                  height={60}
                  className={`object-contain transition-all duration-300 ${isLogoHovered ? `opacity-100 scale-110 ${isLogoRotating ? 'animate-[spin-once_1s_linear_forwards]' : ''}` : 'opacity-80'}`}
                  priority
                />
              </div>

              {/* 外发光效果 */}
              <div className={`absolute inset-0 -m-1 rounded-full blur-md transition-all duration-300 ${isLogoHovered ? 'bg-primary/50 scale-110' : 'bg-primary/10'}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-2 relative overflow-visible">
            {messageRows.map(row => (
              <MessageRow key={row.rowIndex} isEven={row.rowIsEven}>
                {row.messages.map(message => (
                  <Message
                    key={message.index}
                    messageItem={message.messageItem}
                    isEven={message.isEven}
                    delay={message.delay}
                    duration={message.duration}
                    rowIsEven={row.rowIsEven}
                    position={message.position}
                    onClick={handlePresetClick}
                  />
                ))}
              </MessageRow>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
          <Textarea
            ref={textareaRef}
            value={input}
            placeholder={placeholderText}
            onChange={e => setInput(e.target.value)}
            className="flex-1 resize-none transition-all focus:shadow-md rounded-xl p-2.5 min-h-[80px] border-muted-foreground/20 text-sm"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !input.trim()} className="w-full rounded-xl transition-all hover:shadow-md py-5">
            <div className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              <span className="font-medium">{buttonText}</span>
            </div>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
