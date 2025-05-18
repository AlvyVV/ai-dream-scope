import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { findPageConfigById, PageConfigStatus } from '@/models/page-config';
import { getAdminSupabaseClient } from '@/models/db';


export const runtime = "edge";

/**
 * 获取指定代码和版本的所有语言页面配置
 */
async function getAllLanguageVersions(code: string, version: number) {
  try {
    console.log(`[下载API] 查询代码 ${code}，版本 ${version} 的配置`);

    // 首先确认Supabase客户端可用
    const supabase = await getAdminSupabaseClient();

    // 查询已发布状态的记录
    console.log(`[下载API] 查询状态为已发布的记录`);
    const { data, error } = await supabase
      .from('page_configs')
      .select('*')
      .eq('code', code)
      .eq('version', version)
      .eq('status', PageConfigStatus.Published); // 只获取已发布的版本

    if (error) {
      console.error('[下载API] 获取多语言配置时出错:', error);
      throw new Error(`获取多语言配置失败: ${error.message}`);
    }

    console.log(`[下载API] 找到 ${data?.length || 0} 条与代码 ${code} 版本 ${version} 匹配的记录`);

    if (!data || data.length === 0) {
      // 尝试查询任何状态的记录，看看是否存在但不是已发布状态
      const { data: anyStatusData, error: anyStatusError } = await supabase
        .from('page_configs')
        .select('id, code, locale, status, version')
        .eq('code', code)
        .eq('version', version);

      if (anyStatusData && anyStatusData.length > 0) {
        // 记录存在但不是已发布状态
        console.log(
          `[下载API] 找到非已发布状态的记录:`,
          anyStatusData.map(item => ({
            id: item.id,
            locale: item.locale,
            status: item.status,
          }))
        );
        throw new Error(`找到的记录不是已发布状态，无法下载`);
      } else {
        // 完全找不到记录
        console.log(`[下载API] 没有找到任何匹配记录`);
        throw new Error(`找不到代码为 ${code}、版本为 ${version} 的配置`);
      }
    }

    // 记录找到的配置详情
    if (data && data.length > 0) {
      console.log(
        '[下载API] 找到的配置:',
        data.map(item => ({
          id: item.id,
          code: item.code,
          locale: item.locale,
          version: item.version,
          status: item.status,
          has_content: !!item.content && typeof item.content === 'object',
          has_meta: !!item.meta && typeof item.meta === 'object',
        }))
      );
    }

    return data;
  } catch (error: any) {
    console.error('[下载API] 查询多语言配置时出错:', error);
    throw error;
  }
}

/**
 * 处理页面配置下载请求
 */
export async function GET(req: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const versionStr = searchParams.get('version');

    console.log(`[下载API] 收到下载请求，参数：code=${code}, version=${versionStr}`);

    if (!code) {
      return NextResponse.json({ error: '缺少必要参数：code' }, { status: 400 });
    }

    if (!versionStr) {
      return NextResponse.json({ error: '缺少必要参数：version' }, { status: 400 });
    }

    const version = parseInt(versionStr);
    if (isNaN(version)) {
      return NextResponse.json({ error: 'version参数必须是数字' }, { status: 400 });
    }

    // 获取所有语言版本
    const configs = await getAllLanguageVersions(code, version);

    if (!configs || configs.length === 0) {
      console.error(`[下载API] 找不到代码为 ${code}、版本为 ${version} 的已发布配置`);
      return NextResponse.json({ error: '找不到符合条件的页面配置' }, { status: 404 });
    }

    console.log(`[下载API] 准备生成ZIP文件，包含 ${configs.length} 个语言版本`);

    // 创建ZIP文件
    const zip = new JSZip();
    let fileCount = 0;

    // 为每种语言创建JSON文件
    for (const config of configs) {
      const locale = config.locale;

      if (!config.content || typeof config.content !== 'object') {
        console.warn(`[下载API] 警告：${locale}版本的content不是有效对象:`, config.content);
        continue;
      }

      if (!config.meta || typeof config.meta !== 'object') {
        console.warn(`[下载API] 警告：${locale}版本的meta不是有效对象:`, config.meta);
        continue;
      }

      // 合并meta和content字段
      const combinedData = {
        meta: config.meta, // meta字段
        ...config.content, // content字段
      };

      // 检查合并后的数据是否为空
      if (Object.keys(combinedData).length === 0) {
        console.warn(`[下载API] 警告：${locale}版本的合并数据为空对象`);
        continue;
      }

      console.log(
        `[下载API] 添加 ${locale}.json 文件到ZIP，字段数: ${Object.keys(combinedData).length}`
      );

      // 添加到ZIP
      zip.file(`${locale}.json`, JSON.stringify(combinedData, null, 2));
      fileCount++;
    }

    // 如果没有有效文件添加到ZIP
    if (fileCount === 0) {
      console.error(`[下载API] 错误：没有有效的数据可以添加到ZIP文件`);
      return NextResponse.json(
        {
          error: '所有配置的content和meta都为空，无法生成下载文件',
        },
        { status: 400 }
      );
    }

    // 生成ZIP文件内容
    console.log('[下载API] 生成ZIP文件...');
    const zipContent = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    if (!zipContent || zipContent.byteLength === 0) {
      console.error('[下载API] 错误：生成的ZIP文件为空');
      return NextResponse.json({ error: '生成的ZIP文件为空' }, { status: 500 });
    }

    console.log(
      `[下载API] ZIP文件生成完成，大小: ${zipContent.byteLength} 字节，包含 ${fileCount} 个文件`
    );

    // 返回ZIP文件
    console.log(`[下载API] 发送ZIP文件 ${code}.zip 到客户端`);
    const response = new Response(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${code}.zip"`,
        'Content-Length': zipContent.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });

    return response;
  } catch (error: any) {
    console.error('[下载API] 生成下载文件时出错:', error);
    return NextResponse.json(
      { error: `下载失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
