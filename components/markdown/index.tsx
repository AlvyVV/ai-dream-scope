'use client';

import 'highlight.js/styles/atom-one-dark.min.css';
import './markdown.css';

import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';

export default function Markdown({ content }: { content: string }) {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
        } catch (_) {}
      }

      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  // 添加表格样式
  md.renderer.rules.table_open = function () {
    return '<div class="overflow-x-auto my-8 rounded-lg border border-gray-200 dark:border-gray-700"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">';
  };
  md.renderer.rules.table_close = function () {
    return '</table></div>';
  };
  md.renderer.rules.thead_open = function () {
    return '<thead class="bg-gray-50 dark:bg-gray-800">';
  };
  md.renderer.rules.tbody_open = function () {
    return '<tbody class="divide-y divide-gray-200 dark:divide-gray-700">';
  };
  md.renderer.rules.tr_open = function () {
    return '<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">';
  };
  md.renderer.rules.th_open = function () {
    return '<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0">';
  };
  md.renderer.rules.td_open = function () {
    return '<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0">';
  };

  const renderedMarkdown = md.render(content);

  return <div className="max-w-full overflow-x-auto markdown" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />;
}
