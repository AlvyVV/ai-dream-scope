'use client';

import React, { useState, useTransition } from 'react';
import { FormField } from '@/types/blocks/form';
import { Form as FormSlotType } from '@/types/slots/form';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// 动态导入JSON编辑器字段
const JsonField = dynamic(() => import('@/components/blocks/form/json-field'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>,
});

export default function FormSlot({ ...form }: FormSlotType) {
  return (
    <>
      <Header crumb={form.crumb} />
      <div className="w-full px-4 md:px-8 py-8">
        <h1 className="text-2xl font-medium mb-8">{form.title}</h1>
        <div className="overflow-x-auto">
          <FormBlock
            fields={form.fields || []}
            data={form.data}
            passby={form.passby}
            submit={form.submit}
            loading={form.loading}
            toolbar={form.toolbar}
          />
        </div>
      </div>
    </>
  );
}

function FormBlock({
  fields,
  data = {},
  passby = {},
  submit,
  loading = false,
  toolbar,
}: {
  fields: FormField[];
  data: any;
  passby: any;
  submit?: any;
  loading?: boolean;
  toolbar?: any;
}) {
  const [values, setValues] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleFieldChange = (name: string, value: any) => {
    setValues({ ...values, [name]: value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 表单验证
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.validation?.required && !values[field.name || '']) {
        newErrors[field.name || ''] = `${field.title || '字段'} 不能为空`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && submit?.handler) {
      const formData = new FormData();

      // 添加表单数据，确保值是字符串
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // 如果是对象，转换为JSON字符串
          const formValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          formData.append(key, formValue);
        }
      });

      console.log('提交表单数据:', Object.fromEntries(formData.entries()));

      startTransition(async () => {
        try {
          const result = await submit.handler(formData, passby);
          if (result?.status === 'error') {
            setSubmitError(result.message || '提交失败');
          } else if (result?.status === 'success' && result?.redirect_url) {
            // 使用客户端导航
            window.location.href = result.redirect_url;
          }
        } catch (error) {
          console.error('表单提交错误:', error);
          setSubmitError('提交过程中发生错误');
        }
      });
    }
  };

  // 渲染工具栏组件
  const renderToolbarItems = () => {
    if (toolbar && toolbar.items && toolbar.items.length > 0) {
      return (
        <div className="flex items-center gap-2 mb-4">
          {toolbar.items.map((item: any, idx: number) => (
            <div key={idx}>{item.component}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl space-y-6">
      {renderToolbarItems()}

      {fields.map((field, index) => (
        <div key={index} className="space-y-2">
          {renderField(field, values, errors, handleChange, handleFieldChange)}
        </div>
      ))}

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {submitError}
        </div>
      )}

      {submit && (
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending || loading}>
            {isPending || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              submit.button?.title || '提交'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

// 渲染不同类型的表单字段
function renderField(
  field: FormField,
  values: any,
  errors: any,
  handleChange: (e: any) => void,
  handleFieldChange: (name: string, value: any) => void
) {
  const value = values[field.name || ''] || '';
  const error = errors[field.name || ''];

  const labelContent = (
    <div className="flex items-baseline mb-2">
      <label className="block text-sm font-medium">
        {field.title}
        {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.help && <p className="text-xs text-gray-500 ml-2">{field.help}</p>}
    </div>
  );

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'number':
      return (
        <div>
          {labelContent}
          <Input
            type={field.type}
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            {...field.attributes}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div>
          {labelContent}
          <Textarea
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            {...field.attributes}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div>
          {labelContent}
          <Select
            name={field.name}
            value={value}
            onValueChange={newValue => handleFieldChange(field.name || '', newValue)}
            disabled={field.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );

    case 'code_editor':
      return (
        <JsonField
          name={field.name || ''}
          label={field.title || ''}
          value={value}
          required={field.validation?.required}
          disabled={field.disabled}
          error={error}
          height="300px"
          onChange={handleFieldChange}
        />
      );

    default:
      return null;
  }
}
