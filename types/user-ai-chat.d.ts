export interface UserAiChat {
  id?: number;
  uuid?: string;
  project_id?: string;
  thread_id?: string;
  assistant_id?: string;
  content?: {
    content: string;
    metadata?: Record<string, any>;
  };
  token?: string;
  created_at?: string;
  updated_at?: string;
}
