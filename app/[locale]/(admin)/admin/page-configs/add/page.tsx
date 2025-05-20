import { localeNames, locales } from '@/i18n/locale';
import { PageConfigStatus, findPageConfigByCode, insertPageConfig } from '@/models/page-config';

import Empty from '@/components/blocks/empty';
import FormSlot from '@/components/dashboard/slots/form';
import { getAdminSupabaseClient } from '@/models/db';
import { getUserInfo } from '@/services/user';
import { PageConfig } from '@/types/page-config';
import { Form as FormSlotType } from '@/types/slots/form';

export default async function () {
  const user = await getUserInfo();
  if (!user || !user.uuid) {
    return <Empty message="无授权访问" />;
  }

  const form: FormSlotType = {
    title: '添加页面配置',
    crumb: {
      items: [
        {
          title: '页面配置',
          url: '/admin/page-configs',
        },
        {
          title: '添加页面配置',
          is_active: true,
        },
      ],
    },
    fields: [
      {
        name: 'code',
        title: '代码',
        type: 'text',
        placeholder: '页面代码标识符',
        validation: {
          required: true,
        },
      },
      {
        name: 'locale',
        title: '语言',
        type: 'select',
        options: locales.map((locale: string) => ({
          title: localeNames[locale],
          value: locale,
        })),
        value: 'zh',
        validation: {
          required: true,
        },
      },
      {
        name: 'status',
        title: '状态',
        type: 'select',
        options: [
          { title: '草稿', value: PageConfigStatus.Draft.toString() },
          { title: '已发布', value: PageConfigStatus.Published.toString() },
          { title: '已归档', value: PageConfigStatus.Archived.toString() },
        ],
        value: PageConfigStatus.Draft.toString(),
        validation: {
          required: true,
        },
      },
      {
        name: 'content',
        title: '内容 (JSON)',
        type: 'textarea',
        placeholder: '输入 JSON 格式的内容',
        value: '{}',
        validation: {
          required: true,
        },
        attributes: {
          rows: 10,
          className: 'font-mono',
        },
      },
      {
        name: 'meta',
        title: '元数据 (JSON)',
        type: 'textarea',
        placeholder: '输入 JSON 格式的元数据',
        value: '{}',
        validation: {
          required: true,
        },
        attributes: {
          rows: 6,
          className: 'font-mono',
        },
      },
    ],
    submit: {
      button: {
        title: '提交',
      },
      handler: async (data: FormData, passby: any) => {
        'use server';

        try {
          const code = data.get('code') as string;
          const locale = data.get('locale') as string;
          const statusStr = data.get('status') as string;
          const contentStr = data.get('content') as string;
          const metaStr = data.get('meta') as string;

          // 表单验证
          if (!code || !code.trim()) {
            return {
              status: 'error',
              message: '代码不能为空',
            };
          }

          if (!locale || !locale.trim()) {
            return {
              status: 'error',
              message: '语言不能为空',
            };
          }

          console.log('准备提交页面配置:', {
            code,
            locale,
            statusStr,
            contentLength: contentStr.length,
            metaLength: metaStr.length,
          });

          // 验证JSON格式
          let contentObj, metaObj;
          try {
            contentObj = JSON.parse(contentStr);
            console.log('内容JSON解析成功');
          } catch (err) {
            console.error('内容JSON解析失败:', err);
            return {
              status: 'error',
              message: '内容不是有效的JSON格式',
            };
          }

          try {
            metaObj = JSON.parse(metaStr);
            console.log('元数据JSON解析成功');
          } catch (err) {
            console.error('元数据JSON解析失败:', err);
            return {
              status: 'error',
              message: '元数据不是有效的JSON格式',
            };
          }

          // 转换状态为数字
          const status = parseInt(statusStr);

          // 检查是否存在重复配置
          try {
            const existConfig = await findPageConfigByCode(code, locale);
            if (existConfig) {
              console.log('发现重复配置:', existConfig);
              return {
                status: 'error',
                message: `已存在相同代码(${code})和语言(${locale})的页面配置`,
              };
            }
            console.log('未发现重复配置，可以继续');
          } catch (err) {
            console.error('检查重复配置时出错:', err);
            return {
              status: 'error',
              message: '检查重复配置时出错，请稍后重试',
            };
          }

          const currentTime = new Date().toISOString();

          // 准备页面配置数据
          const pageConfig = {
            code,
            content: contentObj,
            locale,
            status,
            meta: metaObj,
            version: 1,
            created_at: currentTime,
            updated_at: currentTime,
          } as PageConfig;
          const supabase = await getAdminSupabaseClient();
          pageConfig.project_id = (await supabase.auth.getUser()).data.user?.id || '';

          console.log('构造的页面配置对象:', JSON.stringify(pageConfig, null, 2));

          try {
            console.log('开始插入页面配置...');
            const result = await insertPageConfig(pageConfig as any);
            console.log('页面配置插入结果:', result);

            return {
              status: 'success',
              message: '页面配置添加成功',
              redirect_url: '/admin/page-configs',
            };
          } catch (err: any) {
            // 详细记录错误
            const errorInfo = {
              message: err?.message,
              code: err?.code,
              details: err?.details,
              hint: err?.hint,
              stack: err?.stack,
            };
            console.error('插入页面配置时出错，详细信息:', errorInfo);

            return {
              status: 'error',
              message: `保存页面配置失败: ${err?.message || err?.details || JSON.stringify(err) || '未知错误'}`,
            };
          }
        } catch (err: any) {
          console.error('表单处理时发生意外错误:', err);
          return {
            status: 'error',
            message: `处理表单时出错: ${err.message || '未知错误'}`,
          };
        }
      },
    },
  };

  return <FormSlot {...form} />;
}
