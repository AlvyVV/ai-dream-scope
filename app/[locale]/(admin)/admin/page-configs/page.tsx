import { NavItem } from '@/types/blocks/base';
import { PageConfig } from '@/types/page-config';
import TableSlot from '@/components/dashboard/slots/table';
import { Table as TableSlotType } from '@/types/slots/table';
import { getAllPageConfigs, PageConfigStatus } from '@/models/page-config';
import moment from 'moment';
import SyncButton from '@/components/blocks/i18n/sync-button';
import PublishButton from '@/components/blocks/page-config/publish-button';
import DownloadButton from '@/components/blocks/page-config/download-button';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit2, Eye } from 'lucide-react';


export const runtime = "edge";

// 英文语言代码，作为主要语言
const PRIMARY_LANGUAGE = 'en';

// 使用缓存获取页面配置列表，确保刷新后能看到最新数据
const getCachedPageConfigs = unstable_cache(
  async () => {
    return await getAllPageConfigs();
  },
  ['page-configs'],
  { revalidate: 10 } // 10秒后自动重新验证
);

export default async function () {
  const pageConfigs = await getCachedPageConfigs();

  // 获取状态标签
  const getStatusLabel = (status: number) => {
    switch (status) {
      case PageConfigStatus.Draft:
        return '草稿';
      case PageConfigStatus.Published:
        return '已发布';
      case PageConfigStatus.Archived:
        return '已归档';
      default:
        return '未知';
    }
  };

  // 获取状态标签样式
  const getStatusStyle = (status: number) => {
    switch (status) {
      case PageConfigStatus.Draft:
        return 'text-orange-600 bg-orange-50 px-2 py-1 rounded';
      case PageConfigStatus.Published:
        return 'text-green-600 bg-green-50 px-2 py-1 rounded';
      case PageConfigStatus.Archived:
        return 'text-gray-600 bg-gray-100 px-2 py-1 rounded';
      default:
        return 'text-gray-600 bg-gray-50 px-2 py-1 rounded';
    }
  };

  // 获取语言标签样式
  const getLanguageStyle = (locale: string) => {
    if (locale === PRIMARY_LANGUAGE) {
      return 'text-blue-600 bg-blue-50 px-2 py-1 rounded font-semibold';
    }
    return 'text-gray-600 bg-gray-50 px-2 py-1 rounded';
  };

  const table: TableSlotType = {
    title: '页面配置',
    toolbar: {
      items: [
        {
          title: '添加配置',
          icon: 'RiAddLine',
          url: '/admin/page-configs/add',
        },
      ],
    },
    columns: [
      {
        name: 'code',
        title: '代码',
      },
      {
        name: 'locale',
        title: '语言',
        callback: (item: PageConfig) => {
          return <span className={getLanguageStyle(item.locale)}>{item.locale}</span>;
        },
      },
      {
        name: 'status',
        title: '状态',
        callback: (item: PageConfig) => {
          return <span className={getStatusStyle(item.status)}>{getStatusLabel(item.status)}</span>;
        },
      },
      {
        name: 'version',
        title: '版本',
      },
      {
        name: 'created_at',
        title: '创建时间',
        callback: (item: PageConfig) => {
          return moment(item.created_at).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        name: 'updated_at',
        title: '更新时间',
        callback: (item: PageConfig) => {
          return moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: '操作',
        className: 'w-[320px]', // 增加宽度以容纳下载按钮
        callback: (item: PageConfig) => {
          const isPrimaryLanguage = item.locale === PRIMARY_LANGUAGE;
          const isDraft = item.status === PageConfigStatus.Draft;
          const isPublished = item.status === PageConfigStatus.Published;

          return (
            <div className="flex items-center gap-2 flex-nowrap">
              {/* 只有英文版本才显示多语言同步按钮 */}
              {isPrimaryLanguage && <SyncButton id={item.id as number} />}

              {/* 只有英文版本且为草稿状态才显示发布按钮 */}
              {isPrimaryLanguage && isDraft && (
                <PublishButton
                  id={item.id as number}
                  code={item.code}
                  version={item.version}
                  locale={item.locale}
                />
              )}

              {/* 只有英文版本且为已发布状态才显示下载按钮 */}
              {isPrimaryLanguage && isPublished && (
                <DownloadButton code={item.code} version={item.version} isPublished={isPublished} />
              )}

              {/* 编辑按钮，只有英文版本可用 */}
              {isPrimaryLanguage ? (
                <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                  <Link href={`/admin/page-configs/${item.id}/edit`}>
                    <Edit2 className="h-4 w-4" />
                    <span>编辑</span>
                  </Link>
                </Button>
              ) : null}

              {/* 查看按钮，所有语言版本都可用 */}
              <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                <Link href={`/admin/page-configs/${item.id}/view`}>
                  <Eye className="h-4 w-4" />
                  <span>查看</span>
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    data: pageConfigs,
    empty_message: '暂无页面配置',
  };

  return <TableSlot {...table} />;
}
