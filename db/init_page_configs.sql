-- 创建页面配置表
CREATE TABLE IF NOT EXISTS page_configs (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  locale VARCHAR(20) NOT NULL DEFAULT 'en',
  status SMALLINT NOT NULL DEFAULT 0,
  meta JSONB NOT NULL DEFAULT '{}'
);

-- 添加唯一约束，确保同一project下的code和locale组合唯一
CREATE UNIQUE INDEX IF NOT EXISTS page_configs_project_code_locale_unique
ON page_configs (project_id, code, locale);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS page_configs_code_idx ON page_configs (code);
CREATE INDEX IF NOT EXISTS page_configs_locale_idx ON page_configs (locale);
CREATE INDEX IF NOT EXISTS page_configs_status_idx ON page_configs (status);

-- 添加注释
COMMENT ON TABLE page_configs IS '页面配置表，存储各种页面的配置信息';
COMMENT ON COLUMN page_configs.id IS '主键ID';
COMMENT ON COLUMN page_configs.project_id IS '项目ID，通常是用户UUID';
COMMENT ON COLUMN page_configs.code IS '页面配置代码，唯一标识符';
COMMENT ON COLUMN page_configs.content IS '页面配置内容，JSON对象';
COMMENT ON COLUMN page_configs.created_at IS '创建时间';
COMMENT ON COLUMN page_configs.updated_at IS '更新时间';
COMMENT ON COLUMN page_configs.version IS '版本号';
COMMENT ON COLUMN page_configs.locale IS '语言代码';
COMMENT ON COLUMN page_configs.status IS '状态: 0=草稿, 1=已发布, 2=已归档';
COMMENT ON COLUMN page_configs.meta IS '元数据，JSON对象';

-- 默认 RLS 策略，所有用户可以查看，但只有已登录用户可以修改自己的数据
ALTER TABLE page_configs ENABLE ROW LEVEL SECURITY;

-- 创建查看权限策略
CREATE POLICY page_configs_select_policy
ON page_configs FOR SELECT
USING (true);

-- 创建插入权限策略（已认证用户）
CREATE POLICY page_configs_insert_policy
ON page_configs FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = project_id);

-- 创建更新权限策略（已认证用户，只能更新自己的数据）
CREATE POLICY page_configs_update_policy
ON page_configs FOR UPDATE
TO authenticated
USING (auth.uid()::text = project_id)
WITH CHECK (auth.uid()::text = project_id);

-- 创建删除权限策略（已认证用户，只能删除自己的数据）
CREATE POLICY page_configs_delete_policy
ON page_configs FOR DELETE
TO authenticated
USING (auth.uid()::text = project_id); 