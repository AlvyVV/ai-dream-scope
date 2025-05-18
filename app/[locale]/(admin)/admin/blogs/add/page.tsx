import { BlogStatus, findBlogBySlug, insertBlog } from '@/models/blog';
import { localeNames, locales } from '@/i18n/locale';

import Empty from '@/components/blocks/empty';
import FormSlot from '@/components/dashboard/slots/form';
import { Form as FormSlotType } from '@/types/slots/form';
import { Blog } from '@/types/blog';
import { getIsoTimestr } from '@/lib/time';
import { getUserInfo } from '@/services/user';
import { getUuid } from '@/lib/hash';


export const runtime = "edge";

export default async function () {
  const user = await getUserInfo();
  if (!user || !user.uuid) {
    return <Empty message="no auth" />;
  }

  const form: FormSlotType = {
    title: 'Add Blog',
    crumb: {
      items: [
        {
          title: 'Blogs',
          url: '/admin/blogs',
        },
        {
          title: 'Add Blog',
          is_active: true,
        },
      ],
    },
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'text',
        placeholder: 'Blog Title',
        validation: {
          required: true,
        },
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'text',
        placeholder: 'what-is-Zitsaas',
        validation: {
          required: true,
        },
        tip: 'blog slug should be unique, visit like: /blog/what-is-Zitsaas',
      },
      {
        name: 'locale',
        title: 'Locale',
        type: 'select',
        options: locales.map((locale: string) => ({
          title: localeNames[locale],
          value: locale,
        })),
        value: 'en',
        validation: {
          required: true,
        },
      },
      {
        name: 'description',
        title: 'Description',
        type: 'textarea',
        placeholder: 'Blog Description',
      },
      {
        name: 'meta_title',
        title: 'Meta Title',
        type: 'text',
        placeholder: 'SEO Meta Title',
        tip: '用于SEO的标题，如果不填写将使用普通标题',
      },
      {
        name: 'meta_description',
        title: 'Meta Description',
        type: 'textarea',
        placeholder: 'SEO Meta Description',
        tip: '用于SEO的描述，如果不填写将使用普通描述',
      },
      {
        name: 'cover_url',
        title: 'Cover URL',
        type: 'url',
        placeholder: 'Blog Cover Image URL',
      },
      {
        name: 'author_name',
        title: 'Author Name',
        type: 'text',
        placeholder: 'Author Name',
      },
      {
        name: 'author_avatar_url',
        title: 'Author Avatar URL',
        type: 'url',
        placeholder: 'Author Avatar Image URL',
      },
      {
        name: 'content',
        title: 'Content',
        type: 'textarea',
        placeholder: 'Blog Content',
        attributes: {
          rows: 10,
        },
      },
    ],
    submit: {
      button: {
        title: 'Submit',
      },
      handler: async (data: FormData, passby: any) => {
        'use server';

        const title = data.get('title') as string;
        const slug = data.get('slug') as string;
        const locale = data.get('locale') as string;
        const description = data.get('description') as string;
        const meta_title = data.get('meta_title') as string;
        const meta_description = data.get('meta_description') as string;
        const cover_url = data.get('cover_url') as string;
        const author_name = data.get('author_name') as string;
        const author_avatar_url = data.get('author_avatar_url') as string;
        const content = data.get('content') as string;

        if (!title || !title.trim() || !slug || !slug.trim() || !locale || !locale.trim()) {
          throw new Error('invalid form data');
        }

        const existBlog = await findBlogBySlug(slug, locale);
        if (existBlog) {
          throw new Error('blog with same slug already exists');
        }

        const blog: Blog = {
          created_at: getIsoTimestr(),
          status: BlogStatus.Offline,
          project_id: process.env.PROJECT_ID,
          title,
          slug,
          locale,
          description,
          meta: {
            title: meta_title,
            description: meta_description,
          },
          cover_url,
          author_name,
          author_avatar_url,
          content,
        };

        try {
          console.log('blog', blog);
          await insertBlog(blog);

          return {
            status: 'success',
            message: 'Blog added',
            redirect_url: '/admin/blogs',
          };
        } catch (err: any) {
          throw new Error(err.message);
        }
      },
    },
  };

  return <FormSlot {...form} />;
}
