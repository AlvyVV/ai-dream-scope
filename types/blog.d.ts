export interface Blog {
  id?: number;
  uuid?: string;
  project_id?: string;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  status?: number;
  cover_url?: string;
  author_name?: string;
  author_avatar_url?: string;
  locale?: string;
  meta?: {
    title?: string;
    description?: string;
  };
}
