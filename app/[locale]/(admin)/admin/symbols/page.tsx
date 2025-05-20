import { getAllItems } from '@/services/item_config';
import SymbolTable from './symbol-table';

// 英文语言代码，作为主要语言
const PRIMARY_LANGUAGE = 'en';

export default async function SymbolsPage() {
  // 获取所有项目配置
  const allItems = await getAllItems();

  // 调试输出
  console.log('获取到的数据总量:', allItems.length);

  // 不筛选category，直接传递所有数据，在客户端组件中查看详细信息
  const symbols = allItems;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">梦境符号管理</h1>
      </div>

      <SymbolTable symbols={symbols} />
    </div>
  );
}
