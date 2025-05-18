'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { locales } from '@/i18n/locale';

/**
 * 翻译测试组件
 */
export default function TestTranslation() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(
    '{"title":"Welcome to our website","description":"This is a test message for translation"}'
  );
  const [results, setResults] = useState<Array<{ locale: string; text: string }>>([]);
  const [apiStatus, setApiStatus] = useState<{
    status: string;
    apiKeyConfigured: boolean;
    message: string;
  } | null>(null);

  // 检查API状态
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/translate/test');
      const data = await response.json();
      setApiStatus(data);

      if (!data.apiKeyConfigured) {
        toast.error('API密钥未配置', {
          description: '请在.env.local中添加GOOGLE_API_KEY',
        });
      } else {
        toast.success('翻译服务就绪');
      }
    } catch (error) {
      toast.error('检查API状态失败');
      console.error('检查API状态失败:', error);
    }
  };

  // 执行翻译测试
  const testTranslation = async () => {
    if (loading) return;
    if (!text.trim()) {
      toast.error('请输入要翻译的文本');
      return;
    }

    try {
      setLoading(true);
      setResults([]);

      const response = await fetch('/api/translate/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          locales,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '翻译测试失败');
      }

      setResults(data.results);

      if (data.unchanged && data.unchanged.length > 0) {
        toast.warning('翻译警告', {
          description: `以下语言的翻译结果与原文相同: ${data.unchanged.join(', ')}`,
        });
      } else {
        toast.success('翻译测试成功');
      }
    } catch (error: any) {
      toast.error('翻译测试失败', {
        description: error.message || '未知错误',
      });
      console.error('翻译测试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">翻译服务测试</h3>
        <Button variant="outline" size="sm" onClick={checkApiStatus}>
          检查API状态
        </Button>
      </div>

      {apiStatus && (
        <div
          className={`p-2 rounded text-sm ${
            apiStatus.apiKeyConfigured ? 'bg-green-50' : 'bg-yellow-50'
          }`}
        >
          {apiStatus.message}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">要翻译的JSON:</label>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="font-mono text-sm"
          placeholder='{"key":"输入要翻译的文本"}'
        />
      </div>

      <Button onClick={testTranslation} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在翻译...
          </>
        ) : (
          '测试翻译'
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">翻译结果:</h4>
          {results.map(result => (
            <div key={result.locale} className="space-y-1">
              <div className="font-medium">{result.locale}:</div>
              <div className="p-2 bg-gray-50 rounded font-mono text-sm whitespace-pre-wrap">
                {result.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
