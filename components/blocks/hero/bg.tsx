'use client';

import { useMemo } from 'react';

export default function HeroBg() {
  // 使用useMemo来确保每次渲染使用相同的值（但仍然在客户端组件中）
  const graySquares = useMemo(() => {
    // 使用固定种子生成"随机"位置，确保每次结果一致
    return Array.from({ length: 12 }).map((_, index) => ({
      // 使用索引值，而不是真正的随机值
      x: (index * 7) % 20, // 0-19 之间的伪随机分布
      y: (index * 3) % 10, // 0-9 之间的伪随机分布
    }));
  }, []); // 空依赖数组确保只计算一次

  return (
    <div className="absolute inset-0 w-full h-[100vh] overflow-hidden -z-50">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* 横向网格线 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 100} x2="2000" y2={i * 100} stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        ))}

        {/* 纵向网格线 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="1000" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        ))}

        {/* 灰色方块 */}
        {graySquares.map((square, index) => (
          <rect key={`square-${index}`} x={square.x * 100} y={square.y * 100} width="100" height="100" fill="#666" opacity="0.05" />
        ))}
      </svg>

      {/* 渐变遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
}
