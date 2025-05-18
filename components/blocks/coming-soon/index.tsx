'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Section as SectionType } from '@/types/blocks/section';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ComingSoon({ section }: { section?: SectionType }) {
  const t = useTranslations('coming_soon');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 调用API
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // 显示成功对话框
        setIsDialogOpen(true);
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative py-16  overflow-hidden max-w-6xl mx-auto">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-white/90 via-white/95 to-white/90 p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-xl ring-1 ring-gray-200 transition-all hover:shadow-lg dark:from-gray-900/90 dark:via-gray-800/95 dark:to-gray-900/90 dark:ring-gray-700">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2v8"></path>
                <path d="m4.93 10.93 1.41 1.41"></path>
                <path d="M2 18h2"></path>
                <path d="M20 18h2"></path>
                <path d="m19.07 10.93-1.41 1.41"></path>
                <path d="M22 22H2"></path>
                <path d="m8 22 4-10 4 10"></path>
              </svg>
            </div>

            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{t('title')}</h2>

            <div className="mb-8 max-w-2xl text-muted-foreground md:text-lg">{t('description')}</div>

            <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 group">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 pl-4 pr-4 bg-background/80 backdrop-blur-sm border-gray-300 focus:border-primary focus:ring-primary transition-all dark:border-gray-600 dark:focus:border-primary"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-md border border-primary/40 opacity-0 -z-10 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"></div>
              </div>
              <Button
                type="submit"
                className="h-12 font-medium px-6 bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/10"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>Processing...</span>
                  </span>
                ) : (
                  t('notification_button')
                )}
              </Button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>Join our early access list and be the first to know</p>
            </div>
          </div>
        </div>
      </section>

      {/* 感谢对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">Thank You!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
              </div>

              <p className="text-base mb-3">Dear valued supporter,</p>
              <p className="text-base mb-3">We sincerely appreciate your interest in our upcoming launch. Your support means the world to us.</p>
              <p className="text-base mb-3">We'll notify you immediately when we're ready to share our experience with you. Stay tuned for an extraordinary journey.</p>
              <p className="text-base font-medium">
                With gratitude,
                <br />
                VV
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                setEmail('');
              }}
              className="mt-2 bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
