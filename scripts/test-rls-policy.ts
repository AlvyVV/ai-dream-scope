/**
 * 测试Supabase行级安全策略(RLS)和页面配置插入
 *
 * 此脚本用于测试以下内容：
 * 1. 使用普通客户端插入数据（预期受RLS影响）
 * 2. 使用服务角色客户端插入数据（预期绕过RLS）
 * 3. 使用管理员登录客户端插入数据（根据RLS策略判断）
 *
 * 使用方法: npx ts-node scripts/test-rls-policy.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, getAdminSupabaseClient } from '../models/db';
import { config } from 'dotenv';
import path from 'path';

// 加载环境变量
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  console.log('===== Supabase RLS策略和页面配置插入测试 =====');

  // 检查必要的环境变量
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ADMIN_EMAIL',
    'SUPABASE_ADMIN_PASSWORD',
    'PROJECT_ID',
  ];

  let missingVars = [];
  for (const v of requiredVars) {
    if (!process.env[v]) {
      missingVars.push(v);
    }
  }

  if (missingVars.length > 0) {
    console.error(`❌ 环境变量缺失: ${missingVars.join(', ')}`);
    console.error('请确保这些变量在.env.local或.env文件中设置');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const project_id = process.env.PROJECT_ID!;

  console.log(`✅ 所有必要的环境变量都已设置`);
  console.log(`🔗 Supabase URL: ${supabaseUrl.substring(0, 20)}...`);

  // 测试数据
  const testPageConfig = {
    code: `test-rls-${Date.now()}`,
    content: { test: true, message: '这是测试数据' },
    locale: 'zh',
    status: 0,
    meta: { title: '测试RLS策略', description: '这是一个测试' },
    project_id: project_id, // 使用环境变量中的项目ID
  };

  try {
    // 1. 使用普通客户端（匿名密钥）- 预期会受到RLS影响
    console.log('\n===== 1. 使用匿名密钥客户端测试插入 =====');
    const anonClient = createClient(supabaseUrl, supabaseKey);

    try {
      const { data: anonData, error: anonError } = await anonClient
        .from('page_configs')
        .insert([testPageConfig])
        .select();

      if (anonError) {
        console.log(`❌ 匿名客户端插入失败（预期行为，受RLS限制）:`);
        console.log(`   错误代码: ${anonError.code}`);
        console.log(`   错误消息: ${anonError.message}`);
        if (anonError.code === '42501') {
          console.log(`   ✅ 确认是RLS策略错误，这是预期行为`);
        }
      } else {
        console.log(`⚠️ 匿名客户端插入成功（意外行为）:`);
        console.log(anonData);
        console.log(`这可能意味着RLS策略没有正确配置或未启用`);
      }
    } catch (e) {
      console.error(`❌ 匿名客户端操作中的异常:`, e);
    }

    // 2. 使用服务角色客户端 - 预期会绕过RLS
    console.log('\n===== 2. 使用服务角色密钥客户端测试插入 =====');
    const serviceRoleClient = createClient(supabaseUrl, serviceRoleKey);

    try {
      // 修改code以避免唯一约束冲突
      const serviceRoleTestConfig = {
        ...testPageConfig,
        code: `service-role-test-${Date.now()}`,
      };

      const { data: serviceRoleData, error: serviceRoleError } = await serviceRoleClient
        .from('page_configs')
        .insert([serviceRoleTestConfig])
        .select();

      if (serviceRoleError) {
        console.log(`❌ 服务角色客户端插入失败（意外行为）:`);
        console.log(`   错误代码: ${serviceRoleError.code}`);
        console.log(`   错误消息: ${serviceRoleError.message}`);
        console.log(`   这可能意味着存在其他问题，而不是RLS限制`);
      } else {
        console.log(`✅ 服务角色客户端插入成功（预期行为）:`);
        console.log(`   插入的记录ID: ${serviceRoleData[0].id}`);
      }
    } catch (e) {
      console.error(`❌ 服务角色客户端操作中的异常:`, e);
    }

    // 3. 使用管理员登录客户端 - 行为取决于RLS策略
    console.log('\n===== 3. 使用管理员登录客户端测试插入 =====');
    try {
      const adminClient = await getAdminSupabaseClient();

      // 修改code以避免唯一约束冲突
      const adminTestConfig = {
        ...testPageConfig,
        code: `admin-test-${Date.now()}`,
      };

      const { data: adminData, error: adminError } = await adminClient
        .from('page_configs')
        .insert([adminTestConfig])
        .select();

      if (adminError) {
        console.log(`❌ 管理员客户端插入失败:`);
        console.log(`   错误代码: ${adminError.code}`);
        console.log(`   错误消息: ${adminError.message}`);

        if (adminError.code === '42501') {
          console.log(`   这是RLS策略错误，意味着您的管理员用户ID与project_id不匹配`);
          console.log(`   当前project_id: ${project_id}`);

          // 检查当前登录用户
          const {
            data: { user },
          } = await adminClient.auth.getUser();
          if (user) {
            console.log(`   当前登录用户ID: ${user.id}`);
            console.log(`   ❗ 警告: project_id与用户ID不匹配，这就是为什么RLS失败的原因`);
          } else {
            console.log(`   ❗ 警告: 无法获取当前用户信息`);
          }
        }
      } else {
        console.log(`✅ 管理员客户端插入成功:`);
        console.log(`   插入的记录ID: ${adminData[0].id}`);

        // 检查当前登录用户
        const {
          data: { user },
        } = await adminClient.auth.getUser();
        if (user) {
          console.log(`   当前登录用户ID: ${user.id}`);
          if (user.id === project_id) {
            console.log(`   ✅ 成功原因: project_id与用户ID匹配，满足RLS策略`);
          } else {
            console.log(
              `   ⚠️ 成功但存在问题: project_id(${project_id})与用户ID(${user.id})不匹配`
            );
            console.log(`      这可能意味着您的RLS策略未正确配置或未启用`);
          }
        }
      }
    } catch (e) {
      console.error(`❌ 管理员客户端操作中的异常:`, e);
    }

    console.log('\n===== 测试完成 =====');
    console.log('根据测试结果检查您的RLS策略配置，修复相关问题');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
