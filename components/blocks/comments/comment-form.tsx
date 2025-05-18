'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { User } from '@/types/user';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CommentFormTranslations {
  error_empty_content: string;
  error_empty_name_email: string;
  error_adding_comment: string;
  success_comment_added: string;
  error_comment_failed: string;
  content_label: string;
  content_placeholder: string;
  name_label: string;
  name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  submitting: string;
  submit_button: string;
}

interface CommentFormProps {
  source_code: string;
  reply_id?: number;
  user?: User | null;
  onSuccess?: () => void;
  className?: string;
  translations?: CommentFormTranslations;
}

export function CommentForm({
  source_code,
  reply_id = 0,
  user,
  onSuccess,
  className,
  translations = {
    error_empty_content: '评论内容不能为空',
    error_empty_name_email: '请填写姓名和电子邮箱',
    error_adding_comment: '添加评论时出错',
    success_comment_added: '评论添加成功',
    error_comment_failed: '评论提交失败',
    content_label: '评论内容',
    content_placeholder: '请输入您的评论',
    name_label: '姓名',
    name_placeholder: '请输入您的姓名',
    email_label: '电子邮箱',
    email_placeholder: '请输入您的电子邮箱',
    submitting: '提交中...',
    submit_button: '提交评论',
  },
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error(translations.error_empty_content);
      return;
    }

    // 检查用户信息
    const isLoggedIn = user && user.uuid && user.email;
    if (!isLoggedIn && (!name.trim() || !email.trim())) {
      toast.error(translations.error_empty_name_email);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code,
          content,
          name: isLoggedIn ? user.nickname : name,
          email: isLoggedIn ? user.email : email,
          user_id: user?.uuid,
          reply_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || translations.error_adding_comment);
      }

      toast.success(translations.success_comment_added);
      setContent('');
      setName('');
      setEmail('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(translations.error_comment_failed, {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 检查用户是否已登录且有完整信息
  const isLoggedIn = user && user.uuid && user.email;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <MarkdownEditor label={translations.content_label} value={content} onChange={setContent} placeholder={translations.content_placeholder} required />

        {!isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {translations.name_label} <span className="text-destructive">*</span>
              </Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={translations.name_placeholder} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {translations.email_label} <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={translations.email_placeholder} required />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translations.submitting}
              </>
            ) : (
              translations.submit_button
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
