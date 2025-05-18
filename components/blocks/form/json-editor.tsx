'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle } from 'lucide-react';

interface JsonEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  height?: string;
  label?: string;
  error?: string;
}

export default function JsonEditor({
  initialValue,
  onChange,
  height = '300px',
  label,
  error,
}: JsonEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 当初始值变化时更新编辑器
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // 格式化JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      setValue(formatted);
      onChange(formatted);
      setIsValid(true);
      setErrorMessage(null);
    } catch (e: any) {
      setIsValid(false);
      setErrorMessage(e.message);
    }
  };

  // 处理编辑器内容变化
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue);
      onChange(newValue);

      // 验证JSON
      try {
        JSON.parse(newValue);
        setIsValid(true);
        setErrorMessage(null);
      } catch (e: any) {
        setIsValid(false);
        setErrorMessage(e.message);
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">{label}</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatJson}
            className="text-xs h-6 px-2"
          >
            格式化JSON
          </Button>
        </div>
      )}

      <div className="relative border rounded-md">
        <Editor
          height={height}
          defaultLanguage="json"
          value={value}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true,
            wordWrap: 'on',
          }}
          className="rounded-md overflow-hidden"
        />

        {/* 状态指示器 */}
        <div className="absolute top-2 right-2">
          {isValid ? (
            <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              <Check size={12} />
              <span>有效JSON</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              <AlertTriangle size={12} />
              <span>无效JSON</span>
            </div>
          )}
        </div>
      </div>

      {/* 错误消息 */}
      {(errorMessage || error) && (
        <div className="mt-1 text-xs text-red-500">{error || errorMessage}</div>
      )}
    </div>
  );
}
