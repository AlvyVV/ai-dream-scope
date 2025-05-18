// 检查 Supabase 设置和连接
import { getSupabaseClient } from '../models/db';

const tablesExpected = ['page_configs'];

async function main() {
  console.log('开始检查 Supabase 设置...\n');

  try {
    // 检查环境变量
    console.log('检查环境变量...');
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ADMIN_EMAIL',
      'SUPABASE_ADMIN_PASSWORD',
    ];

    let missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.error(`❌ 缺少必要的环境变量: ${missingVars.join(', ')}`);
      console.error('请设置这些环境变量后重试');
      process.exit(1);
    }
    console.log('✅ 环境变量设置正确\n');

    // 创建客户端
    console.log('连接到 Supabase...');
    const supabase = getSupabaseClient();
    console.log('✅ Supabase 客户端创建成功\n');

    // 检查表结构
    console.log('检查数据库表...');
    for (const table of tablesExpected) {
      console.log(`  检查表 '${table}'...`);
      const { error } = await supabase.from(table).select('count').limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          console.error(`  ❌ 表 '${table}' 不存在`);
          console.error(`  请在 Supabase 中创建该表，SQL 定义在 db/init_${table}.sql 文件中`);
        } else {
          console.error(`  ❌ 访问表 '${table}' 时出错:`, error.message);
        }
      } else {
        console.log(`  ✅ 表 '${table}' 存在且可访问`);
      }
    }
    console.log('\n');

    // 检查 RLS 策略
    console.log('检查 RLS 策略...');
    // 需要管理员权限才能检查 RLS 策略，这里省略实现
    console.log('⚠️ 无法自动检查 RLS 策略，请在 Supabase 控制台中手动检查\n');

    // 总结
    console.log('检查完成!');
    console.log('如果发现任何问题，请参考 db/README.md 文件进行设置');
  } catch (error) {
    console.error('检查过程中出错:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
