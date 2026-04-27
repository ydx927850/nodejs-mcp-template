# MCP Server 开发指南

本模板用于开发 MCP Server 工具，开发完成后可直接托管到平台上运行。

## 快速开始：新增一个工具

只需两步：

### 1. 定义参数 Schema

在 Schema 定义区域新增一个对象，使用 zod 描述参数结构：

```typescript
export const MyToolArgsSchema = {
  query: z.string().describe('搜索关键词'),
  limit: z.number().int().min(1).max(100).optional().describe('返回数量上限，默认 10'),
};
```

### 2. 在 Controller 中添加工具方法

```typescript
@MCPTool({ description: '搜索相关内容' })
async myTool(
  @ToolArgsSchema(MyToolArgsSchema) args: ToolArgs<typeof MyToolArgsSchema>,
): Promise<MCPToolResponse> {
  // 业务逻辑
  return {
    content: [
      { type: 'text', text: '结果' },
    ],
  };
}
```

## Schema 定义规范

### 基本类型

| Zod 类型 | TypeScript 类型 | 说明 |
|---------|----------------|------|
| `z.string()` | `string` | 字符串 |
| `z.number()` | `number` | 数字 |
| `z.boolean()` | `boolean` | 布尔值 |
| `z.enum(['a','b'])` | `'a' \| 'b'` | 枚举，限制取值范围 |
| `z.array(z.number())` | `number[]` | 数组 |

### 链式约束

```typescript
z.number().int().min(0)        // 非负整数
z.string().min(1).max(100)     // 长度 1~100 的字符串
z.array(z.number()).min(1)     // 至少 1 个元素的数组
```

### 可选参数

```typescript
z.number().optional()          // 调用时可不传，类型为 number | undefined
```

**注意**：使用可选参数时，必须在代码中做空值判断（`if (x !== undefined)` 或 `x ?? defaultValue`）。

### .describe() 是必需的

每个字段都必须加 `.describe()`，LLM 依赖描述来理解参数含义：

```typescript
// 正确
query: z.string().describe('搜索关键词'),

// 错误 — LLM 无法判断何时使用此参数
query: z.string(),
```

## 工具声明规范

### @MCPTool() 装饰器

- `description` 是必需的，描述工具的功能而非实现细节
- 描述应当简洁明确，让 LLM 能准确判断何时调用此工具

```typescript
// 好的描述
@MCPTool({ description: '对两个数进行加法运算' })

// 不好的描述 — 过于宽泛
@MCPTool({ description: '计算' })
```

### 参数绑定

使用 `@ToolArgsSchema()` 绑定 Schema，用 `ToolArgs<typeof Schema>` 推断类型：

```typescript
async myTool(
  @ToolArgsSchema(MySchema) args: ToolArgs<typeof MySchema>,
): Promise<MCPToolResponse> {
  // args 获得完整的 TypeScript 类型提示
}
```

**不要手动定义 args 类型**，始终用 `typeof` 从 Schema 推断，保持类型同步。

### 无参数工具

不需要 `@ToolArgsSchema` 和 `args` 参数：

```typescript
@MCPTool({ description: '获取当前配置' })
async getConfig(): Promise<MCPToolResponse> {
  // ...
}
```

## 返回格式规范

### 正常返回

```typescript
return {
  content: [
    { type: 'text', text: '文本内容' },
  ],
};
```

### 多条内容

`content` 是数组，可返回多条内容，LLM 会按顺序展示：

```typescript
return {
  content: [
    { type: 'text', text: '运算: 1 + 2 + 3' },
    { type: 'text', text: '结果: 6' },
  ],
};
```

### 图片内容

```typescript
return {
  content: [
    {
      type: 'image',
       base64EncodedImage,  // Base64 编码的图片数据
      mimeType: 'image/png',
    },
  ],
};
```

### 资源链接

```typescript
return {
  content: [
    {
      type: 'resource',
      resource: {
        uri: 'file:///path/to/resource',
        mimeType: 'text/plain',
        text: '资源内容',
      },
    },
  ],
};
```

## 错误处理规范

**不要 throw 异常**，而是返回 `isError: true`：

```typescript
if (invalidInput) {
  return {
    content: [
      { type: 'text', text: '清晰描述错误原因' },
    ],
    isError: true,
  };
}
```

LLM 会根据 `isError` 判断工具调用失败，并决定是否重试或告知用户。错误信息应当清晰描述失败原因，帮助 LLM 决定下一步行为。

## 环境变量

平台通过环境变量注入配置，工具内通过 `process.env` 获取：

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `BASE_ENV` | 基础配置（环境标识、服务地址等） | `{"env":"prod","apiBase":"https://..."}` |
| `SENSITIVE_ENV` | 敏感凭证（API Key、Secret 等） | `{"apiKey":"sk-xxx"}` |

读取时始终使用 `??` 提供默认值：

```typescript
const apiKey = process.env.SENSITIVE_ENV ?? '';
```

## 文件结构

```
app/controller/
  mcp.ts          # MCP 工具定义（本文件）
```

当前模板所有工具定义在同一个 Controller 文件中。如果工具数量增多，可按业务领域拆分为多个文件，每个文件一个 `@MCPController()` 类。

## 命名约定

| 元素 | 约定 | 示例 |
|------|------|------|
| Controller 类名 | `MCP` + 领域 + `Controller` | `MCPCalculatorController` |
| Schema 名 | 功能 + `ArgsSchema` | `BatchCalcArgsSchema` |
| 工具方法名 | 动词或动词短语 | `add`, `batchCalculate`, `getEnvConfigs` |
| 工具 description | 简洁的功能描述 | `'对两个数进行加法运算'` |
| Schema 字段 describe | 说明参数含义和约束 | `'结果保留的小数位数，不传则不截断'` |