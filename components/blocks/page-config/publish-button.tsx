'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RocketIcon, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

interface PublishButtonProps {
  id: number;
  code: string;
  version: number;
  locale: string;
  onSuccess?: () => void;
}

export default function PublishButton({
  id,
  code,
  version,
  locale,
  onSuccess,
}: PublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 判断是否为英文版本
  const isEnglishVersion = locale === 'en';

  const handlePublish = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 调用API
      const response = await fetch('/api/page-configs/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, version }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '发布失败');
      }

      // 显示成功消息
      toast.success('发布成功', {
        description:
          data.message ||
          `已发布 ${data.count || 0} 条记录${
            data.archived_count ? `，归档 ${data.archived_count} 条旧版本` : ''
          }`,
      });

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }

      // 刷新页面以显示最新状态
      router.refresh(); // 刷新客户端路由缓存

      // 使用更强制的方式刷新页面数据
      setTimeout(() => {
        router.refresh(); // 二次刷新确保数据更新
        // 如果还有必要，可以重定向到同一个页面强制完全刷新
        // router.push('/admin/page-configs');
      }, 300);
    } catch (error: any) {
      // 显示错误消息
      toast.error('发布失败', {
        description: error.message || '未知错误',
      });

      console.error('发布过程中出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取提示信息
  const getTooltipContent = () => {
    if (isEnglishVersion) {
      return '点击后将发布此版本的所有语言变体，并归档旧版本';
    }
    return '只有英文版本可以发布，会同步所有语言变体';
  };

  // 渲染按钮
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
            disabled={loading || !isEnglishVersion}
            className={`flex items-center gap-1 ${
              isEnglishVersion
                ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RocketIcon className="h-4 w-4" />
            )}
            <span>{loading ? '发布中...' : '发布'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
