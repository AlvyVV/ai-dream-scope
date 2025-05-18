'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export function CodeEditor({ language, value, onChange, height = '200px' }: CodeEditorProps) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  const handleFormat = () => {
    try {
      if (language === 'json') {
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        setContent(formatted);
        onChange(formatted);
      }
    } catch (error) {
      // 如果解析失败，保持原样
      console.error('格式化失败:', error);
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={content}
        onChange={handleChange}
        className={`font-mono text-sm ${language === 'json' ? 'whitespace-pre' : ''}`}
        style={{ height, resize: 'vertical' }}
        onBlur={language === 'json' ? handleFormat : undefined}
      />
      {language === 'json' && (
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md bg-primary/90 px-2 py-1 text-xs text-primary-foreground"
          onClick={handleFormat}
        >
          格式化
        </button>
      )}
    </div>
  );
}
