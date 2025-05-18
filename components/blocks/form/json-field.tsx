'use client';

import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';

interface JsonFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (name: string, value: any) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  height?: string;
}

export default function JsonField({ name, label, value, onChange, required = false, disabled = false, error, height = '300px' }: JsonFieldProps) {
  // 将值转换为格式化的JSON字符串
  const formatValue = (val: any): string => {
    try {
      if (typeof val === 'string') {
        // 尝试解析字符串为JSON对象
        const parsed = JSON.parse(val);
        return JSON.stringify(parsed, null, 2);
      } else if (val && typeof val === 'object') {
        return JSON.stringify(val, null, 2);
      }
      return '{}';
    } catch (e) {
      console.error('JSON格式化错误:', e);
      // 如果解析失败，但值是字符串，返回原始值
      return typeof val === 'string' ? val : '{}';
    }
  };

  const [editorValue, setEditorValue] = useState<string>(formatValue(value));
  const [syntaxError, setSyntaxError] = useState<string | null>(null);

  // 当外部value变化时更新编辑器
  useEffect(() => {
    setEditorValue(formatValue(value));
  }, [value]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (!newValue) return;

    setEditorValue(newValue);

    // 验证JSON并更新父组件
    try {
      const parsedValue = JSON.parse(newValue);
      // 返回JSON字符串而不是对象，确保与表单处理逻辑一致
      onChange(name, JSON.stringify(parsedValue));
      setSyntaxError(null);
    } catch (e) {
      // 仅存储语法错误，但不更新父组件的值
      setSyntaxError('JSON语法错误: ' + (e as Error).message);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline mb-2">
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      <div className={`border rounded-md ${error || syntaxError ? 'border-red-500' : 'border-gray-200'}`}>
        <Editor
          height={height}
          language="json"
          value={editorValue}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            folding: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            readOnly: disabled,
            wordWrap: 'on',
          }}
        />
      </div>

      {(error || syntaxError) && <p className="mt-1 text-xs text-red-500">{error || syntaxError}</p>}
    </div>
  );
}
