'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DownloadIcon, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DownloadButtonProps {
  code: string;
  version: number;
  isPublished: boolean;
}

export default function DownloadButton({ code, version, isPublished }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 显示开始下载的通知
      toast.info('准备下载', {
        description: `正在准备"${code} v${version}"的多语言配置...`,
      });

      // 构建下载URL
      const downloadUrl = `/api/page-configs/download?code=${encodeURIComponent(
        code
      )}&version=${version}`;
      console.log('[下载按钮] 请求下载URL:', downloadUrl);

      // 使用fetch直接获取响应
      let response;
      try {
        response = await fetch(downloadUrl);
      } catch (fetchError) {
        console.error('[下载按钮] 网络请求失败:', fetchError);
        throw new Error('网络请求失败，请检查您的网络连接');
      }

      if (!response.ok) {
        // 尝试解析错误响应
        let errorMessage = '下载失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || '服务器返回错误';
          console.error('[下载按钮] 服务器返回的错误:', errorData);
        } catch (e) {
          console.error('[下载按钮] 无法解析错误响应:', e);

          // 根据HTTP状态提供更明确的错误消息
          if (response.status === 404) {
            errorMessage = `找不到"${code} v${version}"的配置，请确认该版本已发布`;
          } else if (response.status === 500) {
            errorMessage = '服务器内部错误，请联系管理员';
          }
        }
        throw new Error(errorMessage);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      console.log('[下载按钮] 响应Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/zip')) {
        console.warn('[下载按钮] 响应Content-Type不是application/zip:', contentType);
        // 尝试读取可能的错误消息
        try {
          const errorText = await response.text();
          console.error('[下载按钮] 非ZIP响应内容:', errorText);
          throw new Error('服务器未返回ZIP文件，请稍后重试');
        } catch (e) {
          throw new Error('返回的内容类型错误，不是ZIP文件');
        }
      }

      // 获取blob
      let blob;
      try {
        blob = await response.blob();
        console.log('[下载按钮] 获取到响应blob，大小:', blob.size, '字节', 'MIME类型:', blob.type);
      } catch (blobError) {
        console.error('[下载按钮] 获取响应blob失败:', blobError);
        throw new Error('无法处理服务器返回的文件');
      }

      if (blob.size === 0) {
        throw new Error('下载的文件为空');
      }

      // 创建URL并下载
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${code}.zip`;
      document.body.appendChild(link);

      console.log('[下载按钮] 触发下载...');
      link.click();

      // 清理
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        console.log('[下载按钮] 下载链接已清理');
      }, 100);

      toast.success('下载成功', {
        description: `已下载"${code} v${version}"的多语言配置`,
      });
    } catch (error: any) {
      // 显示用户友好的错误消息
      const userMessage = error.message.includes('找不到')
        ? error.message
        : error.message || '下载失败，请稍后重试';

      toast.error('下载失败', {
        description: userMessage,
      });
      console.error('[下载按钮] 下载过程中出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 只允许下载已发布的版本
  if (!isPublished) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            <span>{loading ? '下载中...' : '下载'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>下载所有语言版本的配置文件（ZIP格式）</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
