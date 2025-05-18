'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
  // 预加载和配置插件，避免类型问题
  const plugins = useMemo(() => [remarkGfm], []);

  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown remarkPlugins={plugins}>{content}</ReactMarkdown>
    </div>
  );
}
