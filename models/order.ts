import { Order } from '@/types/order';
import { getAdminSupabaseClient } from './db';

export enum OrderStatus {
  Created = 'created',
  Paid = 'paid',
  Deleted = 'deleted',
}

export async function insertOrder(order: Order) {
  console.log('insertOrder:', order);
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('orders').insert(order);

  if (error) {
    throw error;
  }

  return data;
}

export async function findOrderByOrderNo(order_no: string): Promise<Order | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_no', order_no)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findOrderById(id: number): Promise<Order | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserOrders(
  user_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<Order[] | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_uuid', user_uuid)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getPaidOrders(
  page: number = 1,
  limit: number = 50
): Promise<Order[] | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', OrderStatus.Paid)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);

  if (error) {
    return false;
  }

  return true;
}

export async function updateOrderPaymentInfo(
  id: number,
  payment_id: string,
  payment_status: string,
  payment_method: string,
  payment_amount: number
): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { error } = await supabase
    .from('orders')
    .update({
      payment_id,
      payment_status,
      payment_method,
      payment_amount,
      status: OrderStatus.Paid,
    })
    .eq('id', id);

  if (error) {
    return false;
  }

  return true;
}

export async function updateOrderCheckoutUrl(id: number, checkout_url: string): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { error } = await supabase.from('orders').update({ checkout_url }).eq('id', id);

  if (error) {
    return false;
  }

  return true;
}

export async function getAllOrders(
  page: number = 1,
  limit: number = 50
): Promise<Order[] | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function countOrders(status?: OrderStatus): Promise<number> {
  const supabase = await getAdminSupabaseClient();
  let query = supabase.from('orders').select('*', { count: 'exact', head: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function getFirstPaidOrderByUserUuid(user_uuid: string): Promise<Order | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_uuid', user_uuid)
    .eq('status', 'paid')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getFirstPaidOrderByUserEmail(user_email: string): Promise<Order | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_email', user_email)
    .eq('status', 'paid')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function updateOrderSession(
  order_no: string,
  stripe_session_id: string,
  order_detail: string
) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ stripe_session_id, order_detail })
    .eq('order_no', order_no);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderSubscription(
  order_no: string,
  sub_id: string,
  sub_interval_count: number,
  sub_cycle_anchor: number,
  sub_period_end: number,
  sub_period_start: number,
  status: string,
  paid_at: string,
  sub_times: number,
  paid_email: string,
  paid_detail: string
) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .update({
      sub_id,
      sub_interval_count,
      sub_cycle_anchor,
      sub_period_end,
      sub_period_start,
      status,
      paid_at,
      sub_times,
      paid_email,
      paid_detail,
    })
    .eq('order_no', order_no);

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrdersByUserUuid(user_uuid: string): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_uuid', user_uuid)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getOrdersByUserEmail(user_email: string): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_email', user_email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getOrdersByPaidEmail(paid_email: string): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('paid_email', paid_email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getPaiedOrders(page: number, limit: number): Promise<Order[] | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit);

  if (error) {
    return undefined;
  }

  return data;
}
