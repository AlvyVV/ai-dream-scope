'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';
import { ItemConfig } from '@/types/item-config';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { SymbolInterpretation } from '@/types/pages/interpretation';
import { TagList } from '@/components/ui/tag-list';

// 表单验证Schema
const formSchema = z.object({
  symbol: z.string().min(1, {
    message: '请输入符号',
  }),
});

interface SymbolTableProps {
  symbols: ItemConfig[];
}

export default function SymbolTable({ symbols }: SymbolTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [tableData, setTableData] = useState<ItemConfig[]>([]);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
    },
  });

  // 当props更新时更新状态并处理数据
  useEffect(() => {
    console.log('接收到的数据:', symbols.length);

    // 此处不做筛选，展示所有数据以便检查
    setTableData(symbols);

    console.log('表格数据已更新:', symbols.length);
  }, [symbols]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // 处理表单提交
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

      // 重置表单并关闭对话框
      form.reset();
      setIsDialogOpen(false);

      // 使用API加载更新后的数据
      loadDataFromApi();
    } catch (error) {
      console.error('添加符号失败:', error);
      toast.error(`添加符号失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 直接从API加载数据
  const loadDataFromApi = async () => {
    try {
      setIsLoadingData(true);
      toast.info('正在从API加载数据...');

      // 添加分类参数，只获取梦境符号
      const response = await fetch('/api/get-symbols?category=dream_symbol');
      if (!response.ok) {
        throw new Error('加载数据失败');
      }

      const result = await response.json();
      console.log('API返回数据:', result);

      if (result.success && result.data) {
        setTableData(result.data);
        toast.success(`成功加载${result.data.length}条梦境符号数据`);
      } else {
        toast.error('加载数据失败: ' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error(`加载数据失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 渲染表格前输出数据
  console.log('正在渲染表格, 数据条数:', tableData.length);
  if (tableData.length > 0) {
    console.log('第一条数据:', tableData[0]);
  }

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          onClick={loadDataFromApi}
          disabled={isLoadingData}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          <span>{isLoadingData ? '加载中...' : '刷新数据'}</span>
        </Button>

        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" /> 添加符号
        </Button>
      </div>

      {/* 符号对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      {/* 符号表格 */}
      {tableData.length === 0 ? (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-gray-500">暂无符号数据</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  符号名称
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  符号编码
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  分类
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  标签
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  创建时间
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                  <td className="px-6 py-4">
                    <TagList tags={item.tags} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* 编辑按钮 */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-1"
                      >
                        <Link href={`/admin/symbols/${item.id}/edit`}>
                          <Edit2 className="h-4 w-4" />
                          <span>编辑</span>
                        </Link>
                      </Button>

                      {/* 查看按钮 */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-1"
                      >
                        <Link
                          href={`/${item.locale}/dream-dictionary/${item.code}`}
                          target="_blank"
                        >
                          <Eye className="h-4 w-4" />
                          <span>查看</span>
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
