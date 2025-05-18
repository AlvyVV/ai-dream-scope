export interface PageConfig {
  /**
   * 主键ID，由数据库自动生成
   */
  id?: number;

  /**
   * 项目ID，通常是用户UUID
   */
  project_id: string;

  /**
   * 页面配置代码，唯一标识符
   */
  code: string;

  /**
   * 页面配置内容，JSON对象
   */
  content: Record<string, any>;

  /**
   * 创建时间
   */
  created_at: string;

  /**
   * 更新时间
   */
  updated_at: string;

  /**
   * 版本号
   */
  version: number;

  /**
   * 语言代码
   */
  locale: string;

  /**
   * 状态: 0=草稿, 1=已发布, 2=已归档
   */
  status: number;

  /**
   * 元数据，JSON对象
   */
  meta: Record<string, any>;
}
