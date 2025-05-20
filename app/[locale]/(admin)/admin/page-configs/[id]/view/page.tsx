import Empty from '@/components/blocks/empty';
import { localeNames } from '@/i18n/locale';
import { PageConfigStatus, findPageConfigById } from '@/models/page-config';
import { ArrowLeftIcon } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return <Empty message="无效的 ID" />;
  }

  const pageConfig = await findPageConfigById(id);
  if (!pageConfig) {
    return <Empty message="页面配置不存在" />;
  }

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/page-configs" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeftIcon size={16} />
            <span>返回列表</span>
          </Link>
          <h1 className="text-2xl font-bold">查看页面配置</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">代码</p>
            <p className="font-semibold">{pageConfig.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">语言</p>
            <p className="font-semibold">{localeNames[pageConfig.locale] || pageConfig.locale}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">状态</p>
            <span className={getStatusStyle(pageConfig.status)}>{getStatusLabel(pageConfig.status)}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">版本</p>
            <p className="font-semibold">{pageConfig.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">创建时间</p>
            <p>{moment(pageConfig.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">更新时间</p>
            <p>{moment(pageConfig.updated_at).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">内容 (JSON)</p>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[300px] text-sm font-mono">{JSON.stringify(pageConfig.content, null, 2)}</pre>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">元数据 (JSON)</p>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[200px] text-sm font-mono">{JSON.stringify(pageConfig.meta, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
