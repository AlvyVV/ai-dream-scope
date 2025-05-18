import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { PostgrestClient } from '@supabase/postgrest-js';

export function getPgClient() {
  return new PostgrestClient(process.env.PG_API_URL!);
}

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || '';

  let supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key is not set');
  }

  const client = createClient(supabaseUrl, supabaseKey);

  return client;
}

/**
 * 获取已登录的 Supabase 客户端
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns 已登录的 Supabase 客户端
 */
export async function getLoggedInSupabaseClient(email: string, password: string): Promise<SupabaseClient> {
  const supabase = getSupabaseClient();

  // 等待登录完成
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('登录失败:', error.message);
    throw new Error(`自动登录失败: ${error.message}`);
  }

  return supabase;
}

/**
 * 使用环境变量中配置的默认管理员账户获取已登录的 Supabase 客户端
 * 需要在环境变量中设置 SUPABASE_ADMIN_EMAIL 和 SUPABASE_ADMIN_PASSWORD
 * @returns 已登录的 Supabase 客户端
 */
export async function getAdminSupabaseClient(): Promise<SupabaseClient> {
  return SupabaseClientManager.getInstance().getAdminClient();
}

// 添加一个单例模式来管理 Supabase 客户端
export class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private adminClient: SupabaseClient | null = null;
  private lastLoginTime: number = 0;
  private readonly SESSION_TIMEOUT = 1000 * 60 * 60; // 1小时

  private constructor() {}

  public static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  public async getAdminClient(): Promise<SupabaseClient> {
    const now = Date.now();

    // 如果客户端存在且会话未过期，直接返回
    if (this.adminClient && now - this.lastLoginTime < this.SESSION_TIMEOUT) {
      return this.adminClient;
    }

    // 重新登录
    const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
    const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('管理员账户信息未配置，请在环境变量中设置 SUPABASE_ADMIN_EMAIL 和 SUPABASE_ADMIN_PASSWORD');
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      throw new Error(`管理员登录失败: ${error.message}`);
    }

    this.adminClient = supabase;
    this.lastLoginTime = now;

    return this.adminClient;
  }
}
