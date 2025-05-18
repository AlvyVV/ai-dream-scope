module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 200,
  trailingComma: 'es5',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'avoid',
  parser: 'typescript', // 默认使用 typescript 解析器
  jsxSingleQuote: false,
  // 为不同文件类型指定不同的解析器
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        parser: 'json',
        trailingComma: 'none', // JSON 不支持尾随逗号
      },
    },
  ],
};
