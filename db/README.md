# Supabase 数据库设置

本目录包含项目所需的数据库表和策略的 SQL 定义。您需要在 Supabase 项目中执行这些 SQL 脚本来创建必要的表和权限。

## 执行步骤

1. 登录 Supabase 控制台 (https://app.supabase.com)
2. 选择您的项目
3. 点击左侧菜单中的 **SQL 编辑器**
4. 创建一个新的查询
5. 复制并粘贴以下 SQL 文件的内容，然后运行：
   - `init_page_configs.sql` - 创建页面配置表和相关权限

## 表结构说明

### page_configs 表

此表用于存储页面配置信息，包括：

- **id**: 主键，自动递增
- **project_id**: 项目ID，通常是用户的UUID（重要！这个值应该与用户的auth.uid匹配，用于RLS策略）
- **code**: 页面代码，唯一标识符
- **content**: 页面内容，JSON格式
- **created_at**: 创建时间
- **updated_at**: 更新时间
- **version**: 版本号
- **locale**: 语言代码
- **status**: 状态 (0=草稿, 1=已发布, 2=已归档)
- **meta**: 元数据，JSON格式

## 行级安全策略 (RLS)

这些表使用 Supabase 的行级安全策略 (RLS) 来确保数据安全：

- 所有用户可以查看所有页面配置
- 只有已认证的用户可以创建新配置，且 project_id 必须等于用户的 auth.uid
- 用户只能更新或删除自己创建的配置（project_id = auth.uid）

### 关于 RLS 策略的重要说明

当向表中插入数据时，必须确保：

1. **已认证用户**：用户必须已通过Supabase认证
2. **project_id匹配**：插入数据的project_id必须与当前用户的auth.uid()完全匹配
3. **类型匹配**：auth.uid()返回的是UUID，而project_id是字符串，所以SQL中使用auth.uid()::text进行转换

## 问题排查

如果您在添加页面配置时遇到错误，可能的原因包括：

1. **表不存在**: 确保您已经在 Supabase 中创建了 `page_configs` 表
2. **权限问题**: 检查行级安全策略是否正确设置
   - 特别注意RLS错误: `new row violates row-level security policy for table "page_configs"`
   - 这通常表示您的 `project_id` 与当前用户的 `auth.uid()` 不匹配
3. **类型错误**: 确保数据类型与表定义匹配
4. **唯一约束冲突**: 检查是否已存在具有相同 project_id, code 和 locale 的记录
5. **认证问题**: 确保用户已正确登录，且认证状态可用

### 解决RLS错误的方法

1. **确保project_id与用户ID匹配**: 在插入数据前，获取当前认证用户ID并设置为project_id
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (user) {
     dataToInsert.project_id = user.id;
   }
   ```

2. **使用服务角色密钥绕过RLS**: 如果需要管理员权限，可以使用service_role密钥创建客户端
   ```typescript
   const serviceRoleClient = createClient(
     process.env.SUPABASE_URL || '',
     process.env.SUPABASE_SERVICE_ROLE_KEY || '',
     {
       auth: { persistSession: false, autoRefreshToken: false }
     }
   );
   ```

3. **测试RLS策略**: 运行`scripts/test-rls-policy.ts`脚本测试不同客户端下的权限

4. **检查环境变量**: 确保`.env.local`文件中设置了正确的Supabase URL和API密钥

如需更多帮助，请查看 [Supabase 文档](https://supabase.com/docs)。 