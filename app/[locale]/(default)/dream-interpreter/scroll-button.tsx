'use client';

import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScrollButtonProps {
  label: string;
}

export default function ScrollButton({ label }: ScrollButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 创建按钮呼吸效果的定时器
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 4000);

    return () => clearInterval(animationInterval);
  }, []);

  const handleClick = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-md ${isAnimating ? 'opacity-75 scale-110' : 'opacity-50 scale-100'} transition-all duration-1000`}
      ></div>
      <Button onClick={handleClick} className="relative bg-white hover:bg-white/90 text-purple-700 shadow-sm hover:shadow-md transition-all duration-500 ease-out">
        {label}
        <ArrowDown className="ml-2 h-4 w-4 animate-bounce" />
      </Button>

      {/* 额外的向下指示箭头动画 */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-70">
        <div className="h-1 w-1 rounded-full bg-purple-500 mb-1 animate-ping"></div>
        <div className="h-1 w-1 rounded-full bg-purple-500 mb-1 animate-ping" style={{ animationDelay: '300ms' }}></div>
        <div className="h-1 w-1 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: '600ms' }}></div>
      </div>
    </div>
  );
}
