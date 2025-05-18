'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DreamInterpretation() {
  const t = useTranslations('dream');
  const [dream, setDream] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dream.trim()) {
      toast.error(t('emptyDream'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dream,
          locale: 'zh', // 这里可以根据实际语言设置调整
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to interpret dream');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error(t('error'));
      console.error('Dream interpretation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dreamInput')}</label>
              <Textarea
                value={dream}
                onChange={e => setDream(e.target.value)}
                placeholder={t('dreamPlaceholder')}
                className="min-h-[200px]"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                t('analyze')
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('interpretation')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{result.interpretation}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('symbols')}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.symbols.map((symbol: string, index: number) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {symbol}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('emotions')}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.emotions.map((emotion: string, index: number) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {emotion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('advice')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{result.advice}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
