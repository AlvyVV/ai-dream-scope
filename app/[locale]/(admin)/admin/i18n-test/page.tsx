import TestTranslation from '@/components/blocks/i18n/test-translation';


export const runtime = "edge";

export default function TranslationTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">多语言翻译测试</h1>
      <p className="mb-6 text-gray-600">
        使用此页面测试多语言翻译功能。您可以输入JSON内容并测试翻译结果，确保Google API
        密钥正确配置且翻译服务正常工作。
      </p>

      <div className="bg-white rounded-lg shadow">
        <TestTranslation />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">注意事项</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>
            确保在<code className="bg-gray-100 px-1 rounded">.env.local</code>文件中设置了
            <code className="bg-gray-100 px-1 rounded">GOOGLE_API_KEY</code>
          </li>
          <li>翻译API使用Google Gemini API，需要有效的API密钥</li>
          <li>如果翻译结果与原文相同，通常是因为API密钥问题或翻译服务配置错误</li>
          <li>测试大型JSON对象时，请注意API有可能会有字符限制</li>
        </ul>
      </div>
    </div>
  );
}
