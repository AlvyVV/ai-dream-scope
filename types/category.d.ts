export interface Category {
  category_id: string;
  project_id: string;
  name: string;
  code: string;
  locale: string;
  slug: string;
  meta?: Record<string, any> | null;
  page_config?: Record<string, any> | null;
  created_at: Date;
}

export interface CategoryCreateInput {
  project_id: string;
  name: string;
  code: string;
  locale: string;
  slug: string;
  meta?: Record<string, any> | null;
  page_config?: Record<string, any> | null;
}

export interface CategoryUpdateInput {
  project_id?: string;
  name?: string;
  code?: string;
  locale?: string;
  slug?: string;
  meta?: Record<string, any> | null;
  page_config?: Record<string, any> | null;
}

export interface CategoryWhereInput {
  id?: number;
  project_id?: string;
  code?: string;
  locale?: string;
  slug?: string;
}

export interface CategoryOrderByInput {
  field: keyof Category;
  direction: 'asc' | 'desc';
}

export interface CategoryPaginationInput {
  page?: number;
  pageSize?: number;
  orderBy?: CategoryOrderByInput;
}
