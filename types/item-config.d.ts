export interface ItemConfig {
  /**
   * 主键ID，由数据库自动生成
   */
  id?: number;

  /**
   * 语言代码
   */
  locale?: string;

  /**
   * 项目 ID
   */
  project_id?: string;

  /**
   * 唯一编码
   */
  code: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 标签ID
   */
  tags?: string[];

  /**
   * 名称
   */
  name?: string;

  /**
   * 分类ID
   */
  category?: string;

  /**
   * 页面配置，JSON对象
   */
  page_config?: Record<string, any>;

  /**
   * 创建时间
   */
  created_at?: string;

  /**
   * 图片URL
   */
  img?: string;

  /**
   * 排序
   */
  sort?: number;
}
