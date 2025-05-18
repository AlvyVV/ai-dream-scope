'use client';

import { useEffect, useRef } from 'react';

export function ClarityAnalytics() {
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // 避免重复加载
    if (hasLoadedRef.current) return;

    // 使用动态导入而不是静态导入，减少初始加载的JavaScript大小
    const loadClarity = async () => {
      // 检查是否在生产环境
      if (process.env.NODE_ENV !== 'production') {
        return; // 开发环境不加载分析工具
      }

      const projectId = `quu943pkkj`;

      // 验证当前域名是否匹配NEXT_PUBLIC_WEB_URL
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const allowedHostname = process.env.NEXT_PUBLIC_WEB_URL ? new URL(process.env.NEXT_PUBLIC_WEB_URL).hostname : '';

      // 检查用户是否禁用了跟踪（尊重用户隐私设置）
      const doNotTrack = navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes' || window.doNotTrack === '1';

      if (doNotTrack) {
        console.log('尊重用户隐私设置，不加载分析工具');
        return;
      }

      // 只有当项目ID存在且域名匹配时才初始化Clarity
      if (projectId && allowedHostname && currentHostname === allowedHostname) {
        try {
          // 动态导入Clarity
          const Clarity = await import('@microsoft/clarity').then(module => module.default);

          // 使用requestIdleCallback或setTimeout延迟加载，在浏览器空闲时初始化
          const initClarity = () => {
            try {
              Clarity.init(projectId);
              hasLoadedRef.current = true;
            } catch (error) {
              console.error('Failed to initialize Clarity:', error);
            }
          };

          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(initClarity, { timeout: 5000 }); // 设置5秒超时
          } else {
            // 等待更长时间，确保关键内容先加载完成
            setTimeout(initClarity, 3000); // 3秒后初始化
          }
        } catch (error) {
          // 静默处理错误，不影响用户体验
          console.error('Failed to load Clarity:', error);
        }
      }
    };

    // 仅在网络空闲时加载分析工具
    if ('connection' in navigator && (navigator as any).connection?.effectiveType === '4g') {
      // 网络状况好时直接加载
      if (document.readyState === 'complete') {
        loadClarity();
      } else {
        window.addEventListener('load', loadClarity, { once: true });
      }
    } else {
      // 网络状况不佳时，延迟加载
      if (document.readyState === 'complete') {
        setTimeout(loadClarity, 3000);
      } else {
        window.addEventListener(
          'load',
          () => {
            setTimeout(loadClarity, 3000);
          },
          { once: true }
        );
      }
    }

    // 清理函数
    return () => {
      window.removeEventListener('load', loadClarity);
    };
  }, []);

  return null;
}
