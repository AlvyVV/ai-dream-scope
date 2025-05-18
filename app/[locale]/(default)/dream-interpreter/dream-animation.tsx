'use client';

import { useEffect, useState } from 'react';

export default function DreamAnimation() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted || !isMobile) return null;

  return (
    <div className="relative h-40 overflow-hidden">
      {/* 星星背景 */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-400"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 4 + 3}s infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* 太阳 */}
      <div
        className="absolute rounded-full bg-yellow-300 shadow-lg"
        style={{
          width: '40px',
          height: '40px',
          top: '20%',
          left: '15%',
          animation: 'float 8s ease-in-out infinite',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
        }}
      />

      {/* 云朵 */}
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: '60px',
          height: '30px',
          top: '15%',
          left: '40%',
          animation: 'floatCloud 15s linear infinite',
          opacity: 0.8,
        }}
      />
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: '80px',
          height: '40px',
          top: '25%',
          left: '60%',
          animation: 'floatCloud 20s linear infinite 5s',
          opacity: 0.9,
        }}
      />

      {/* 动态梦境元素 */}
      <div
        className="absolute text-indigo-600 text-3xl"
        style={{
          top: '40%',
          left: '25%',
          animation: 'float 6s ease-in-out infinite 1s',
          transform: 'rotate(-15deg)',
        }}
      >
        ✨
      </div>

      <div
        className="absolute text-blue-500 text-3xl"
        style={{
          top: '30%',
          left: '75%',
          animation: 'float 7s ease-in-out infinite 0.5s',
          transform: 'rotate(10deg)',
        }}
      >
        🌙
      </div>

      <div
        className="absolute text-pink-500 text-2xl"
        style={{
          top: '60%',
          left: '55%',
          animation: 'float 5s ease-in-out infinite 2s',
        }}
      >
        💭
      </div>

      <div
        className="absolute text-indigo-400 text-2xl"
        style={{
          top: '50%',
          left: '35%',
          animation: 'float 9s ease-in-out infinite 3s',
          transform: 'rotate(-5deg)',
        }}
      >
        🔮
      </div>

      <div
        className="absolute text-purple-500 text-2xl"
        style={{
          top: '55%',
          left: '80%',
          animation: 'float 8s ease-in-out infinite 4s',
          transform: 'rotate(5deg)',
        }}
      >
        🦋
      </div>

      {/* 额外的CSS动画 */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes floatCloud {
          0% {
            transform: translateX(0);
            opacity: 0.8;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(-100vw);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
