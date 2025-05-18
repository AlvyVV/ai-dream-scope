'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

// 动态导入编辑器组件以避免SSR问题
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

// 导入样式
import 'easymde/dist/easymde.min.css';

export interface MarkdownEditorProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  required?: boolean;
}

export function MarkdownEditor({ id, label, value, onChange, placeholder = '请输入内容...', className, minHeight = '150px', maxHeight = '300px', required = false }: MarkdownEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // 解决水合错误问题
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 使用 useCallback 包装 onChange 处理函数
  const handleChange = useCallback(
    (value: string) => {
      onChange(value);
    },
    [onChange]
  );

  // 使用 useMemo 缓存编辑器选项
  const options = useMemo(
    () => ({
      autofocus: false,
      spellChecker: false,
      placeholder,
      status: false,
      autosave: {
        enabled: true,
        uniqueId: id || 'markdown-editor',
        delay: 1000,
      },
      toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'guide'] as any, // 使用 any 类型避免类型错误
    }),
    [id, placeholder]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {isMounted && (
        <div style={{ minHeight, maxHeight }} className="border rounded-md overflow-hidden">
          <SimpleMdeReact value={value} onChange={handleChange} options={options} className="prose prose-sm dark:prose-invert" />
        </div>
      )}
    </div>
  );
}
