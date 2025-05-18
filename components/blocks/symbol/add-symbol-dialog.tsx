'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { interpretSymbolClient } from '@/services/symbol';
import { SymbolInterpretation } from '@/types/pages/interpretation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// 表单验证Schema
const formSchema = z.object({
  symbol: z.string().min(1, {
    message: '请输入符号',
  }),
});

interface AddSymbolDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function AddSymbolDialog({ open, onOpenChange }: AddSymbolDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 添加调试日志
  useEffect(() => {
    console.log('AddSymbolDialog - received open state:', open);
  }, [open]);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // 调用API解析符号
      toast.info('正在解析符号，请稍候...');
      console.log('开始解析符号:', values.symbol);

      const response = await fetch('/api/symbols/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: values.symbol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '符号解析失败');
      }

      const result = await response.json();
      console.log('符号解析任务已开始:', result);

      // 成功提示
      toast.success('符号解析任务已开始处理，请稍后刷新查看结果');

      // 重置表单
      form.reset();

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      console.error('添加符号失败:', error);
      toast.error(`添加符号失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 调试输出当前渲染状态
  console.log('AddSymbolDialog - rendering with open =', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加梦境符号</DialogTitle>
          <DialogDescription>输入一个梦境符号，系统将自动解析其含义和解释</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>符号</FormLabel>
                  <FormControl>
                    <Input placeholder="如：蛇、飞翔、坠落..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '处理中...' : '确定'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
