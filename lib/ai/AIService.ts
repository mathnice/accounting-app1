// AI Service Interface and Types

export interface ParsedTransaction {
  amount: number | null;
  type: 'income' | 'expense';
  categoryName: string;
  note: string;
  confidence: number;
}

export interface ObjectRecognitionResult {
  objectName: string;
  categoryName: string;
  confidence: number;
}

export interface ReceiptRecognitionResult {
  merchantName: string | null;
  amount: number | null;
  date: string | null;
  items: Array<{ name: string; price: number }>;
  categoryName: string;
  confidence: number;
}

export interface ImageRecognitionResult {
  mode: 'object' | 'receipt';
  object?: ObjectRecognitionResult;
  receipt?: ReceiptRecognitionResult;
}

export interface CategorySuggestion {
  categoryName: string;
  confidence: number;
}

// AI Service Interface
export interface IAIService {
  parseTransactionText(text: string): Promise<ParsedTransaction>;
  recognizeImage(imageBase64: string, mode: 'object' | 'receipt'): Promise<ImageRecognitionResult>;
  suggestCategories(description: string): Promise<CategorySuggestion[]>;
}

// Default/fallback values
export const defaultParsedTransaction: ParsedTransaction = {
  amount: null,
  type: 'expense',
  categoryName: '其他支出',
  note: '',
  confidence: 0,
};

export const defaultObjectResult: ObjectRecognitionResult = {
  objectName: '未知物品',
  categoryName: '其他支出',
  confidence: 0,
};

export const defaultReceiptResult: ReceiptRecognitionResult = {
  merchantName: null,
  amount: null,
  date: null,
  items: [],
  categoryName: '其他支出',
  confidence: 0,
};

// AI Prompts
export const aiPrompts = {
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
