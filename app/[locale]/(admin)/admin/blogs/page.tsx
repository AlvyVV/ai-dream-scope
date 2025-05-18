import { NavItem } from '@/types/blocks/base';
import { Blog } from '@/types/blog';
import TableSlot from '@/components/dashboard/slots/table';
import { Table as TableSlotType } from '@/types/slots/table';
import { getAllBlogs } from '@/models/blog';
import moment from 'moment';
import SyncButtonPost from '@/components/blocks/i18n/sync-button-post';
import DeleteButton from '@/components/blocks/post/delete-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit2, Eye } from 'lucide-react';


export const runtime = "edge";

// 英文语言代码，作为主要语言
const PRIMARY_LANGUAGE = 'en';

export default async function () {
  const blogs = await getAllBlogs();

  const table: TableSlotType = {
    title: 'Blogs',
    toolbar: {
      items: [
        {
          title: 'Add Blog',
          icon: 'RiAddLine',
          url: '/admin/blogs/add',
        },
      ],
    },
    columns: [
      {
        name: 'title',
        title: 'Title',
      },
      {
        name: 'description',
        title: 'Description',
      },
      {
        name: 'slug',
        title: 'Slug',
      },
      {
        name: 'locale',
        title: 'Locale',
      },
      {
        name: 'status',
        title: 'Status',
      },
      {
        name: 'created_at',
        title: 'Created At',
        callback: (item: Blog) => {
          return moment(item.created_at).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: '操作',
        className: 'w-[350px]',
        callback: (item: Blog) => {
          const isPrimaryLanguage = item.locale === PRIMARY_LANGUAGE;

          return (
            <div className="flex items-center gap-2">
              {/* 只有英文版本才显示多语言同步按钮 */}
              {isPrimaryLanguage && <SyncButtonPost uuid={item.uuid || ''} />}

              {/* 编辑按钮 */}
              <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                <Link href={`/admin/blogs/${item.uuid}/edit`}>
                  <Edit2 className="h-4 w-4" />
                  <span>编辑</span>
                </Link>
              </Button>

              {/* 查看按钮 */}
              <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                <Link href={`/${item.locale}/posts/${item.slug}`} target="_blank">
                  <Eye className="h-4 w-4" />
                  <span>查看</span>
                </Link>
              </Button>

              {/* 删除按钮 */}
              <DeleteButton uuid={item.uuid || ''} />
            </div>
          );
        },
      },
    ],
    data: blogs,
    empty_message: 'No posts found',
  };

  return <TableSlot {...table} />;
}
