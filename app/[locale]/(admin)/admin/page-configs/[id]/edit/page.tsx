import { localeNames } from '@/i18n/locale';
import { PageConfigStatus, findPageConfigByCode, findPageConfigById, findPreviousVersionPageConfig, insertPageConfig, updatePageConfig } from '@/models/page-config';
import { redirect } from 'next/navigation';

import Empty from '@/components/blocks/empty';
import SyncButton from '@/components/blocks/i18n/sync-button';
import FormSlot from '@/components/dashboard/slots/form';
import { getUserInfo } from '@/services/user';
import { PageConfig } from '@/types/page-config';
import { Form as FormSlotType } from '@/types/slots/form';

// 英文语言代码，作为主要语言
const PRIMARY_LANGUAGE = 'en';

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;
  const user = await getUserInfo();
  if (!user || !user.uuid) {
    return <Empty message="无授权访问" />;
  }

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return <Empty message="无效的 ID" />;
  }

  // 检查是否是创建新页面
  const isNewPage = id === 0;

  let pageConfig: PageConfig | undefined;

  if (!isNewPage) {
    pageConfig = await findPageConfigById(id);
    if (!pageConfig) {
      return <Empty message="页面配置不存在" />;
    }

    // 如果不是英文版本，重定向到查看页面
    if (pageConfig.locale !== PRIMARY_LANGUAGE) {
      redirect(`/admin/page-configs/${id}/view`);
    }
  } else {
    // 创建新页面时的默认配置
    pageConfig = {
      id: 0,
      project_id: '',
      code: '',
      content: {},
      meta: {},
      locale: PRIMARY_LANGUAGE,
      status: PageConfigStatus.Draft,
      version: 1, // 新页面默认版本号为1
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 是否为已发布状态
  const isPublished = pageConfig.status === PageConfigStatus.Published;

  // 处理表单数据
  const formData = {
    ...pageConfig,
    content: JSON.stringify(pageConfig.content, null, 2),
    meta: JSON.stringify(pageConfig.meta, null, 2),
    status: isPublished ? PageConfigStatus.Draft.toString() : pageConfig.status.toString(), // 已发布状态默认为草稿
  };

  const form: FormSlotType = {
    title: isNewPage ? '添加页面配置' : isPublished ? `编辑页面配置 (新版本 v${pageConfig.version + 1})` : '编辑页面配置',
    crumb: {
      items: [
        {
          title: '页面配置',
          url: '/admin/page-configs',
        },
        {
          title: isNewPage ? '添加页面配置' : '编辑页面配置',
          is_active: true,
        },
      ],
    },
    toolbar: {
      items: !isNewPage
        ? [
            {
              title: '多语言同步',
              component: <SyncButton id={id} />,
            },
          ]
        : [],
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
        options: [
          // 只允许选择英文
          {
            title: localeNames[PRIMARY_LANGUAGE] || PRIMARY_LANGUAGE,
            value: PRIMARY_LANGUAGE,
          },
        ],
        disabled: true, // 英文版本的语言也不允许修改
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
        validation: {
          required: true,
        },
        disabled: isPublished, // 如果是编辑已发布的配置，状态固定为草稿
      },
      {
        name: 'version',
        title: '版本',
        type: 'number',
        disabled: true, // 版本号不允许编辑
        help: isPublished ? '编辑已发布的配置将自动创建新版本' : isNewPage ? '首次创建版本号为1' : '版本号不可编辑',
      },
      {
        name: 'content',
        title: '内容 (JSON)',
        type: 'code_editor', // 我们自定义的JSON编辑器类型
        placeholder: '输入 JSON 格式的内容',
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
        type: 'code_editor', // 自定义的JSON编辑器类型
        placeholder: '输入 JSON 格式的元数据',
        validation: {
          required: true,
        },
        attributes: {
          rows: 6,
          className: 'font-mono',
        },
      },
    ],
    data: formData,
    passby: {
      user,
      pageConfig,
      isPublished,
      isNewPage,
    },
    submit: {
      button: {
        title: isNewPage ? '创建' : isPublished ? '创建新版本' : '更新',
      },
      handler: async (data: FormData, passby: any) => {
        'use server';

        try {
          const { user, pageConfig, isPublished, isNewPage } = passby;
          if (!user || !pageConfig) {
            return {
              status: 'error',
              message: '无效的参数：用户或页面配置信息缺失',
            };
          }

          // 确保只有英文版本可以编辑
          if (!isNewPage && pageConfig.locale !== PRIMARY_LANGUAGE) {
            return {
              status: 'error',
              message: '只有英文版本可以编辑',
              redirect_url: `/admin/page-configs/${pageConfig.id}/view`,
            };
          }

          const code = data.get('code') as string;
          const locale = PRIMARY_LANGUAGE; // 固定使用英文作为语言
          const statusStr = data.get('status') as string;
          const contentStr = data.get('content') as string;
          const metaStr = data.get('meta') as string;
          const version = isNewPage
            ? 1 // 新配置版本号为1
            : isPublished
            ? pageConfig.version + 1
            : pageConfig.version;

          // 调试日志
          console.log('接收到的表单数据:', {
            code,
            locale,
            status: statusStr,
            content: contentStr.substring(0, 100) + '...',
            meta: metaStr.substring(0, 100) + '...',
            version,
          });

          // 表单验证
          if (!code || !code.trim()) {
            return {
              status: 'error',
              message: '代码不能为空',
            };
          }

          // 验证JSON格式
          let contentObj, metaObj;
          try {
            // 去除可能存在的UTF-8 BOM标记
            const cleanContentStr = contentStr.replace(/^\uFEFF/, '');
            contentObj = JSON.parse(cleanContentStr);
          } catch (err) {
            console.error('内容JSON解析错误:', err, '\n原始内容:', contentStr);
            return {
              status: 'error',
              message: '内容不是有效的JSON格式',
            };
          }

          try {
            // 去除可能存在的UTF-8 BOM标记
            const cleanMetaStr = metaStr.replace(/^\uFEFF/, '');
            metaObj = JSON.parse(cleanMetaStr);
          } catch (err) {
            console.error('元数据JSON解析错误:', err, '\n原始元数据:', metaStr);
            return {
              status: 'error',
              message: '元数据不是有效的JSON格式',
            };
          }

          // 状态处理：如果是已发布状态编辑，强制设为草稿
          const status = isPublished ? PageConfigStatus.Draft : parseInt(statusStr);

          const currentTime = new Date().toISOString();

          // 如果是新配置或已发布状态，创建新记录
          if (isNewPage || isPublished) {
            try {
              // 检查是否存在重复配置
              const existConfig = await findPageConfigByCode(code, locale);
              if (existConfig && (isNewPage || existConfig.status === PageConfigStatus.Draft)) {
                return {
                  status: 'error',
                  message: `已存在${isNewPage ? '' : '草稿状态的'}相同配置 (${code}, ${locale})`,
                };
              }

              // 如果是创建新版本，检查是否存在小于当前版本号的记录
              if (!isNewPage && version > 1) {
                const previousVersion = await findPreviousVersionPageConfig(code, locale, version);
                if (!previousVersion) {
                  return {
                    status: 'error',
                    message: `无法创建版本 ${version}，找不到小于该版本号的最大版本记录`,
                  };
                }
              }

              // 创建新记录
              const newConfig: Partial<PageConfig> = {
                project_id: user.uuid,
                code,
                content: contentObj,
                locale,
                status: isNewPage ? status : PageConfigStatus.Draft,
                meta: metaObj,
                created_at: currentTime,
                updated_at: currentTime,
                version: version,
              };

              const insertedData = await insertPageConfig(newConfig);

              if (!insertedData) {
                throw new Error(`${isNewPage ? '创建' : '创建新版本'}失败`);
              }

              return {
                status: 'success',
                message: isNewPage ? '页面配置创建成功' : `已创建新版本 (v${version})`,
                redirect_url: '/admin/page-configs',
              };
            } catch (err: any) {
              console.error(`${isNewPage ? '创建' : '创建新版本'}时出错:`, err);
              return {
                status: 'error',
                message: `${isNewPage ? '创建' : '创建新版本'}失败: ${err.message || '未知错误'}`,
              };
            }
          } else {
            // 常规更新操作
            try {
              // 检查是否存在重复配置
              const existConfig = await findPageConfigByCode(code, locale);
              if (existConfig && existConfig.id !== pageConfig.id) {
                return {
                  status: 'error',
                  message: `已存在相同代码(${code})和语言(${locale})的页面配置`,
                };
              }
            } catch (err) {
              console.error('检查重复配置时出错:', err);
              return {
                status: 'error',
                message: '检查重复配置时出错，请稍后重试',
              };
            }

            // 执行更新
            const updatedConfig: Partial<PageConfig> = {
              code,
              content: contentObj,
              locale,
              status,
              meta: metaObj,
              updated_at: currentTime,
              version: version,
            };

            try {
              await updatePageConfig(pageConfig.id, updatedConfig);

              return {
                status: 'success',
                message: '页面配置更新成功',
                redirect_url: '/admin/page-configs',
              };
            } catch (err: any) {
              console.error('更新页面配置时出错:', err);
              return {
                status: 'error',
                message: `更新页面配置失败: ${err.message || '未知错误'}`,
              };
            }
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
