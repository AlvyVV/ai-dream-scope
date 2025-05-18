'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  uuid: string;
}

export default function DeleteButton({ uuid }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (loading) return;

    // 确认删除
    if (!confirm('确定要删除此帖子吗？此操作不可恢复。')) {
      return;
    }

    try {
      setLoading(true);

      // 调用API
      const response = await fetch('/api/posts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      // 显示成功消息
      toast.success('帖子删除成功');

      // 刷新页面列表
      router.refresh();
    } catch (error: any) {
      // 显示错误消息
      toast.error('帖子删除失败', {
        description: error.message || '未知错误',
      });

      console.error('删除过程中出错:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span>{loading ? '删除中...' : '删除'}</span>
    </Button>
  );
}
