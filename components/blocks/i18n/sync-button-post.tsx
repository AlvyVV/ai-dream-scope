'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FiGlobe } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SyncButtonProps {
  uuid: string;
  onSuccess?: (data: any) => void;
}

export default function SyncButtonPost({ uuid, onSuccess }: SyncButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 调用API
      const response = await fetch('/api/posts/i18n-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '同步失败');
      }

      // 显示成功消息
      toast.success('多语言同步成功', {
        description: data.message,
      });

      // 调用成功回调
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error: any) {
      // 显示错误消息
      toast.error('多语言同步失败', {
        description: error.message || '未知错误',
      });

      console.error('同步过程中出错:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-1"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FiGlobe className="h-4 w-4" />}
      <span>{loading ? '正在同步...' : '多语言同步'}</span>
    </Button>
  );
}
