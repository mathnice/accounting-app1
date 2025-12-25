import { config } from './index';

// AI Provider types
export type AIProvider = 'doubao' | 'deepseek' | 'zhipu';

// AI Configuration
export const aiConfig = {
  provider: config.ai.provider,
  apiKey: config.ai.apiKey,
  baseUrl: config.ai.baseUrl,
  timeout: config.ai.timeout,
  
  // Get current model names based on provider
  get textModel(): string {
    return config.ai.models[this.provider].text;
  },
  
  get visionModel(): string {
    return config.ai.models[this.provider].vision;
  },
  
  // Provider-specific base URLs
  providerUrls: {
    doubao: 'https://ark.cn-beijing.volces.com/api/v3',
    deepseek: 'https://api.deepseek.com/v1',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  },
  
  // Get effective base URL
  getBaseUrl(): string {
    if (config.ai.baseUrl) {
      return config.ai.baseUrl;
    }
    return this.providerUrls[this.provider];
  },
};

// Prompts for AI services
export const aiPrompts = {
  // Transaction text parsing prompt
  transactionParse: `你是一个智能记账助手。请从用户输入的自然语言中提取交易信息。

请严格按照以下JSON格式返回结果：
{
  "amount": 数字或null（如果无法识别金额）,
  "type": "income" 或 "expense"（根据语义判断是收入还是支出）,
  "categoryName": "分类名称",
  "note": "备注信息",
  "confidence": 0到1之间的数字（表示识别置信度）
}

可用的支出分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出
可用的收入分类：工资、奖金、投资、其他收入

示例：
输入："午餐花了35元"
输出：{"amount": 35, "type": "expense", "categoryName": "餐饮", "note": "午餐", "confidence": 0.95}

输入："收到工资8000"
输出：{"amount": 8000, "type": "income", "categoryName": "工资", "note": "工资", "confidence": 0.98}

请只返回JSON，不要有其他文字。`,

  // Object recognition prompt
  objectRecognition: `你是一个智能图像识别助手。请识别图片中的主要物品，并判断它属于哪个消费分类。

请严格按照以下JSON格式返回结果：
{
  "objectName": "识别到的物品名称",
  "categoryName": "消费分类",
  "confidence": 0到1之间的数字（表示识别置信度）
}

可用的消费分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出

示例：
- 识别到汉堡/饭菜/饮料 → 分类为"餐饮"
- 识别到衣服/鞋子/包 → 分类为"购物"
- 识别到药品/医疗器械 → 分类为"医疗"
- 识别到书籍/文具 → 分类为"教育"
- 识别到电影票/游戏 → 分类为"娱乐"

请只返回JSON，不要有其他文字。`,

  // Receipt recognition prompt
  receiptRecognition: `你是一个智能票据识别助手。请识别这张收据/发票/小票，提取关键信息。

请严格按照以下JSON格式返回结果：
{
  "merchantName": "商家名称",
  "amount": 总金额数字,
  "date": "日期，格式YYYY-MM-DD，如果无法识别则为null",
  "items": [{"name": "商品名", "price": 价格数字}],
  "categoryName": "消费分类"
}

可用的消费分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出

注意：
- 金额请提取数字，不要包含货币符号
- 如果无法识别某个字段，请设为null
- items数组可以为空[]

请只返回JSON，不要有其他文字。`,

  // Category suggestion prompt
  categorySuggestion: `你是一个智能分类助手。根据以下描述，推荐最合适的消费分类。

可用的支出分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出
可用的收入分类：工资、奖金、投资、其他收入

请返回最多3个最可能的分类，按置信度从高到低排序，格式如下：
{
  "suggestions": [
    {"categoryName": "分类名", "confidence": 0.9},
    {"categoryName": "分类名", "confidence": 0.7},
    {"categoryName": "分类名", "confidence": 0.5}
  ]
}

请只返回JSON，不要有其他文字。`,
};

export default aiConfig;
