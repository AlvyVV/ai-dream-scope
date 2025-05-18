export interface Comment {
  id?: number;
  project_id?: string;
  source_code: string;
  reply_id?: number;
  user_id?: string;
  content: string;
  is_deleted?: number;
  created_at?: string;
  name?: string;
  email?: string;
  reply_count?: number;
  avatar_url?: string;
}
