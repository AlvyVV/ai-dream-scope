import { User } from '@/types/user';
import { getAdminSupabaseClient } from './db';

export async function insertUser(user: User) {
  const supabase = await getAdminSupabaseClient();
  console.log('insertUser-data', await supabase.auth.getUser());
  user.project_id = (await supabase.auth.getUser()).data.user?.id;
  console.log('insertUser', user);
  const { data, error } = await supabase.from('users').insert(user);

  if (error) {
    throw error;
  }

  return data;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findUserByUuid(uuid: string): Promise<User | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('users').select('*').eq('uuid', uuid).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUsers(page: number = 1, limit: number = 50): Promise<User[] | undefined> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;

  const offset = (page - 1) * limit;
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}
