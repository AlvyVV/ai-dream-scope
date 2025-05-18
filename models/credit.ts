import { Credit } from '@/types/credit';
import { getAdminSupabaseClient } from './db';

export async function insertCredit(credit: Credit) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('credits').insert(credit);

  if (error) {
    throw error;
  }

  return data;
}

export async function findCreditByTransNo(trans_no: string): Promise<Credit | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('trans_no', trans_no)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserValidCredits(user_uuid: string): Promise<Credit[] | undefined> {
  const now = new Date().toISOString();
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_uuid', user_uuid)
    .gte('expired_at', now)
    .order('expired_at', { ascending: true });

  if (error) {
    return undefined;
  }

  return data;
}

export async function findCreditsByUserUuid(
  user_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<Credit[] | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_uuid', user_uuid)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function findValidCreditsByUserUuid(user_uuid: string): Promise<Credit[] | undefined> {
  const now = new Date().toISOString();
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_uuid', user_uuid)
    .gt('credits', 0)
    .or(`expired_at.gt.${now},expired_at.is.null`)
    .order('created_at', { ascending: true });

  if (error) {
    return undefined;
  }

  return data;
}

export async function getCredits(
  page: number = 1,
  limit: number = 50
): Promise<Credit[] | undefined> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;

  const offset = (page - 1) * limit;
  const supabase = await getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}
