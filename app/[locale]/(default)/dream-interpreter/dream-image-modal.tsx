'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DreamImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DreamImageModal({ imageUrl, isOpen, onClose }: DreamImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user, setShowSignModal } = useAppContext();
  const t = useTranslations();

  useEffect(() => {
    if (isOpen && imageUrl) {
      console.log('[DEBUG] Opening image modal, URL:', imageUrl);
      // Reset state
      setIsLoading(true);
      setHasError(false);

      // 如果用户未登录，自动弹出登录框
      if (!user) {
        setShowSignModal(true);
      }
    }
  }, [isOpen, imageUrl, user, setShowSignModal]);

  const handleImageLoad = () => {
    console.log('[DEBUG] Image loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error('[DEBUG] Image failed to load:', imageUrl);
    setIsLoading(false);
    setHasError(true);
    toast.error('Image failed to load, please try again later');
  };

  // 辅助函数：截断过长的URL，保留开头和结尾
  const truncateUrl = (url: string, maxLength: number = 60) => {
    if (!url || url.length <= maxLength) return url;

    const start = url.substring(0, Math.floor(maxLength / 2));
    const end = url.substring(url.length - Math.floor(maxLength / 2));

    return `${start}...${end}`;
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.info(t('MyChats.loginRequired'));
      setShowSignModal(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Dream Image</DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-square rounded-md overflow-hidden border">
          {imageUrl && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}

              {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                  <p className="text-red-500 font-medium mb-2">Image failed to load</p>
                  <p className="text-sm text-gray-500 overflow-hidden text-center">{truncateUrl(imageUrl)}</p>
                </div>
              ) : (
                <>
                  <Image src={imageUrl} alt="Generated dream image" fill className={cn('object-cover', isLoading ? 'opacity-0' : 'opacity-100')} onLoad={handleImageLoad} onError={handleImageError} />
                  <a href="https://ko-fi.com/Y8Y21DH2HI" target="_blank">
                    <img height="36" style={{ border: '0px', height: '36px' }} src="https://storage.ko-fi.com/cdn/kofi4.png?v=6" alt="Buy Me a Coffee at ko-fi.com" />
                  </a>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>

          {!hasError && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" download="dream-image.png" onClick={handleDownloadClick}>
                Download Image
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 w-full sm:w-auto"
            onClick={() => {
              console.log('[DEBUG] Copying image URL to clipboard:', imageUrl);
              navigator.clipboard
                .writeText(imageUrl)
                .then(() => toast.success('URL copied to clipboard'))
                .catch(err => {
                  console.error('[DEBUG] Failed to copy URL:', err);
                  toast.error('Failed to copy URL');
                });
            }}
          >
            Copy Image Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
