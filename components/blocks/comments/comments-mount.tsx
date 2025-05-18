'use client';
// 这是一个客户端挂载脚本
// @ts-nocheck

import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CommentsClient } from './CommentsClient';

// 挂载评论组件的客户端脚本
export function CommentsMountScript() {
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;

    console.log('[CLIENT] 开始挂载评论组件');

    // 查找挂载点
    const mountPoint = document.getElementById('comments-mount-point');
    if (!mountPoint) {
      console.error('[CLIENT] 未找到评论组件挂载点');
      return;
    }

    try {
      // 创建根并渲染
      console.log('[CLIENT] 创建评论组件React根');
      const root = createRoot(mountPoint);
      root.render(<CommentsClient />);
      console.log('[CLIENT] 评论组件挂载成功');
    } catch (error) {
      console.error('[CLIENT] 评论组件挂载失败', error);
    }
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
