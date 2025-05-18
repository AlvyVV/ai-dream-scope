/**
 * 比较两个对象并返回变更的部分
 * @param before 变更前的对象
 * @param current 变更后的对象
 * @returns 包含 put 和 del 字段的对象，分别表示新增/修改和删除的字段
 */
export function compareObjects(
  before: Record<string, any>,
  current: Record<string, any>
): {
  put: Record<string, any>;
  del: string[];
} {
  const result = {
    put: {} as Record<string, any>,
    del: [] as string[],
  };

  // 遍历当前对象的所有字段
  for (const key in current) {
    // 如果是新增字段或字段值变更
    if (!(key in before) || JSON.stringify(before[key]) !== JSON.stringify(current[key])) {
      result.put[key] = current[key];
      continue;
    }

    // 如果是对象类型，进行深度比较
    if (
      typeof current[key] === 'object' &&
      current[key] !== null &&
      typeof before[key] === 'object' &&
      before[key] !== null
    ) {
      const beforeObj = before[key] || {};
      const fieldResult = deepCompare(beforeObj, current[key], key);

      // 合并结果
      if (Object.keys(fieldResult.put).length > 0) {
        result.put[key] = fieldResult.put;
      }

      // 合并删除路径
      result.del = result.del.concat(fieldResult.del);
    }
  }

  // 处理删除的字段
  for (const key in before) {
    if (!(key in current)) {
      result.del.push(key);
    }
  }

  // 调试日志
  console.log('对象比较结果:', {
    before_keys: Object.keys(before),
    current_keys: Object.keys(current),
    put_keys: Object.keys(result.put),
    del: result.del,
  });

  return result;
}

/**
 * 递归比较两个对象的所有层级
 * @param before 变更前的值
 * @param current 变更后的值
 * @param path 当前字段的路径
 * @returns 包含 put 和 del 的结果对象
 */
function deepCompare(
  before: any,
  current: any,
  path: string
): {
  put: Record<string, any>;
  del: string[];
} {
  const result = {
    put: {} as Record<string, any>,
    del: [] as string[],
  };

  // 如果类型不同，直接放入 put
  if (typeof before !== typeof current) {
    return { put: current, del: [] };
  }

  // 处理数组类型
  if (Array.isArray(current)) {
    // 如果之前不是数组或者长度不同，直接整个替换
    if (!Array.isArray(before) || before.length !== current.length) {
      return { put: [...current], del: [] };
    }

    // 逐个元素比较
    let isDifferent = false;

    for (let i = 0; i < current.length; i++) {
      // 如果任何元素不同，整个数组视为变更
      if (JSON.stringify(before[i]) !== JSON.stringify(current[i])) {
        isDifferent = true;
        break;
      }
    }

    if (isDifferent) {
      return { put: [...current], del: [] };
    }

    return { put: {}, del: [] };
  }

  // 如果不是对象，直接比较值
  if (typeof current !== 'object' || current === null) {
    if (before === current) {
      return { put: {}, del: [] };
    }
    return { put: current, del: [] };
  }

  // 处理对象
  for (const key in current) {
    const beforeValue = before[key];
    const currentValue = current[key];
    const currentPath = `${path}.${key}`;

    // 递归比较
    const fieldResult = deepCompare(beforeValue, currentValue, currentPath);

    // 合并修改/新增结果
    if (
      Object.keys(fieldResult.put).length > 0 ||
      (typeof fieldResult.put !== 'object' && fieldResult.put !== undefined)
    ) {
      result.put[key] = fieldResult.put;
    }

    // 合并删除路径
    result.del = result.del.concat(fieldResult.del);
  }

  // 处理此级别的删除字段
  for (const key in before) {
    if (!(key in current)) {
      result.del.push(`${path}.${key}`);
    }
  }

  return result;
}
