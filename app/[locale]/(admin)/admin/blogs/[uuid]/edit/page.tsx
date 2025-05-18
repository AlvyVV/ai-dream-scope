import { localeNames, locales } from '@/i18n/locale';
import { findBlogBySlug, findBlogByUuid, updateBlog } from '@/models/blog';

import Empty from '@/components/blocks/empty';
import FormSlot from '@/components/dashboard/slots/form';
import { getIsoTimestr } from '@/lib/time';
import { getUserInfo } from '@/services/user';
import { Blog } from '@/types/blog';
import { Form as FormSlotType } from '@/types/slots/form';

export const runtime = 'edge';

export default async function Page(props: { params: Promise<{ uuid: string; locale: string }> }) {
  const params = await props.params;
  const user = await getUserInfo();
  if (!user || !user.uuid) {
    return <Empty message="no auth" />;
  }

  const blog = await findBlogByUuid(params.uuid);
  if (!blog) {
    return <Empty message="blog not found" />;
  }

  const form: FormSlotType = {
    title: 'Edit Blog',
    crumb: {
      items: [
        {
          title: 'Blogs',
          url: '/admin/blogs',
        },
        {
          title: 'Edit Blog',
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
    data: blog,
    passby: {
      user,
      blog,
    },
    submit: {
      button: {
        title: 'Submit',
      },
      handler: async (data: FormData, passby: any) => {
        'use server';

        const { user, blog } = passby;
        if (!user || !blog || !blog.uuid) {
          throw new Error('invalid params');
        }

        const title = data.get('title') as string;
        const slug = data.get('slug') as string;
        const locale = data.get('locale') as string;
        const status = data.get('status') as string;
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
        if (existBlog && existBlog.uuid !== blog.uuid) {
          throw new Error('blog with same slug already exists');
        }

        const updatedBlog: Partial<Blog> = {
          updated_at: getIsoTimestr(),
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
          await updateBlog(blog.uuid, updatedBlog);

          return {
            status: 'success',
            message: 'Blog updated',
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
