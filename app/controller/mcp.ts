import {
  MCPController,
  ToolArgs,
  MCPToolResponse,
  MCPTool,
  ToolArgsSchema,
  Extra,
  ToolExtra,
} from '@eggjs/tegg';
import * as z from 'zod/v4';

// ============================================================================
// Schema 定义区域
// ============================================================================
//
// 使用 zod/v4 定义工具的参数结构。MCP 框架会基于 Schema 做两件事：
// 1. 自动生成 JSON Schema，供 LLM 理解工具的输入格式，决定何时调用
// 2. 运行时对传入参数进行类型校验，不合法时会自动拒绝
//
// 重要：每个字段都必须使用 .describe() 添加描述，LLM 依赖描述来理解参数含义
// ============================================================================

/**
 * 基础二元运算参数 Schema
 *
 * 最简单的参数定义：两个 number 类型的操作数。
 * 这是最常用的参数定义模式，大多数工具只需要几个简单字段。
 *
 * 重要：每个字段都必须使用 .describe() 添加描述，LLM 依赖描述来理解参数含义。
 * 当前 @ToolArgsSchema 装饰器要求传入 raw shape 对象（即 { key: z.xxx() }），
 * 而非 z.object() 的返回值，否则 TypeScript 类型会报错。
 */
export const BinaryOpArgsSchema = {
  a: z.number().describe('第一个操作数'),
  b: z.number().describe('第二个操作数'),
};

/**
 * 批量运算参数 Schema
 *
 * 演示更复杂的参数类型组合：
 * - z.enum():  枚举类型，限制参数只能取预定义的值
 * - z.array(): 数组类型，可链式调用 .min()/.max() 限制长度
 * - z.number().int().min(0): 链式约束，整数且 >= 0
 * - z.xxx.optional(): 可选参数，调用时可以不传
 */
export const BatchCalcArgsSchema = {
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('运算类型'),
  operands: z
    .array(z.number())
    .min(2)
    .describe('操作数列表，至少需要两个数字'),
  precision: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('结果保留的小数位数，不传则不截断'),
  roundMode: z
    .enum(['round', 'floor', 'ceil'])
    .optional()
    .describe('舍入模式，默认 round'),
};

export const FetchJsonplaceholderArgsSchema = {
  resource: z
    .enum(['posts', 'comments', 'albums', 'photos', 'todos', 'users'])
    .describe('资源类型'),
  resource_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('资源ID，不传则获取列表'),
};

// ============================================================================
// Controller 定义区域
// ============================================================================
//
// @MCPController() 将类声明为一个 MCP 工具集，一个类中的所有 @MCPTool() 方法
// 共同构成该 MCP Server 提供的工具列表。
//
// 命名建议：MCP + 业务领域 + Controller，如 MCPCalculatorController
// ============================================================================

@MCPController()
export class MCPCalculatorController {

  // --------------------------------------------------------------------------
  // 基础工具：加法
  // --------------------------------------------------------------------------
  //
  // 这是一个最完整的 MCP Tool 示例，展示了所有必要元素：
  //
  // 1. @MCPTool({ description: '...' })
  //    - description 是必需的，LLM 根据描述判断何时调用此工具
  //    - 描述应当简洁明确，说明工具的功能，而非实现细节
  //
  // 2. @ToolArgsSchema(Schema)
  //    - 绑定参数 Schema，框架据此进行校验和 JSON Schema 生成
  //
  // 3. args: ToolArgs<typeof Schema>
  //    - 使用 typeof 自动推断参数类型，获得完整的 TypeScript 类型提示
  //    - 不要手动定义 args 类型，始终保持与 Schema 同步
  //
  // 4. 返回值: MCPToolResponse
  //    - content 是数组，可包含多条内容
  //    - 每条内容必须有 type 字段，目前支持 'text' | 'image' | 'resource'
  //    - 最常用的是 type: 'text'，text 字段为文本内容
  // --------------------------------------------------------------------------
  @MCPTool({ description: '对两个数进行加法运算' })
  async add(
    @ToolArgsSchema(BinaryOpArgsSchema) args: ToolArgs<typeof BinaryOpArgsSchema>,
  ): Promise<MCPToolResponse> {
    const result = args.a + args.b;

    return {
      content: [
        {
          type: 'text',
          text: `${args.a} + ${args.b} = ${result}`,
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 基础工具：减法 / 乘法
  // --------------------------------------------------------------------------
  // 与加法结构一致，复用相同的 Schema，仅业务逻辑不同。
  // 当多个工具的参数结构相同时，直接复用同一个 Schema 即可。
  // --------------------------------------------------------------------------

  @MCPTool({ description: '对两个数进行减法运算' })
  async subtract(
    @ToolArgsSchema(BinaryOpArgsSchema) args: ToolArgs<typeof BinaryOpArgsSchema>,
  ): Promise<MCPToolResponse> {
    const result = args.a - args.b;

    return {
      content: [
        {
          type: 'text',
          text: `${args.a} - ${args.b} = ${result}`,
        },
      ],
    };
  }

  @MCPTool({ description: '对两个数进行乘法运算' })
  async multiply(
    @ToolArgsSchema(BinaryOpArgsSchema) args: ToolArgs<typeof BinaryOpArgsSchema>,
  ): Promise<MCPToolResponse> {
    const result = args.a * args.b;

    return {
      content: [
        {
          type: 'text',
          text: `${args.a} × ${args.b} = ${result}`,
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 错误处理：除法
  // --------------------------------------------------------------------------
  //
  // 演示 MCP 工具的错误处理模式：
  //
  // - 当输入不合法或业务逻辑无法继续时，返回 isError: true
  // - LLM 会根据 isError 判断工具调用失败，并决定是否重试或告知用户
  // - 错误信息放在 content[0].text 中，应当清晰描述失败原因
  // - 不要抛出异常（throw），而是通过 isError 返回错误，让框架统一处理
  // --------------------------------------------------------------------------
  @MCPTool({ description: '对两个数进行除法运算' })
  async divide(
    @ToolArgsSchema(BinaryOpArgsSchema) args: ToolArgs<typeof BinaryOpArgsSchema>,
  ): Promise<MCPToolResponse> {
    if (args.b === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '除数不能为零',
          },
        ],
        isError: true,
      };
    }

    const result = args.a / args.b;

    return {
      content: [
        {
          type: 'text',
          text: `${args.a} ÷ ${args.b} = ${result}`,
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 复杂参数 & 多条 content：批量运算
  // --------------------------------------------------------------------------
  //
  // 演示以下高级用法：
  //
  // 1. z.enum() — 限制参数为预定义值之一，LLM 只会传入合法的枚举值
  // 2. z.array() — 接收数组参数，可链式 .min()/.max() 限制长度
  // 3. z.xxx.optional() — 可选参数，调用时可以不传，使用时需做空值判断
  // 4. 多条 content — content 数组可返回多条内容，LLM 会按顺序展示
  // --------------------------------------------------------------------------
  @MCPTool({ description: '对多个数字执行批量运算，支持设置精度和舍入模式' })
  async batchCalculate(
    @ToolArgsSchema(BatchCalcArgsSchema) args: ToolArgs<typeof BatchCalcArgsSchema>,
  ): Promise<MCPToolResponse> {
    const { operation, operands, precision, roundMode } = args;

    // 除法需要检查除数是否为零
    if (operation === 'divide' && operands.slice(1).some(n => n === 0)) {
      return {
        content: [
          {
            type: 'text',
            text: '除法运算中除数不能为零',
          },
        ],
        isError: true,
      };
    }

    // 执行运算
    let result: number;
    switch (operation) {
      case 'add':
        result = operands.reduce((sum, n) => sum + n, 0);
        break;
      case 'subtract':
        result = operands.reduce((diff, n) => diff - n);
        break;
      case 'multiply':
        result = operands.reduce((product, n) => product * n, 1);
        break;
      case 'divide':
        result = operands.reduce((quotient, n) => quotient / n);
        break;
    }

    // 应用精度和舍入模式（可选参数，需判空）
    if (precision !== undefined) {
      const mode = roundMode ?? 'round';
      const factor = Math.pow(10, precision);
      if (mode === 'floor') {
        result = Math.floor(result * factor) / factor;
      } else if (mode === 'ceil') {
        result = Math.ceil(result * factor) / factor;
      } else {
        result = Math.round(result * factor) / factor;
      }
    }

    // 演示返回多条 content：将计算过程和结果分两条返回
    return {
      content: [
        {
          type: 'text',
          text: `运算: ${operands.join(` ${symbolOf(operation)} `)}`,
        },
        {
          type: 'text',
          text: `结果: ${result}`,
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 无参数工具 & 环境变量：获取平台配置
  // --------------------------------------------------------------------------
  //
  // 演示以下用法：
  //
  // 1. 无参数工具 — 不使用 @ToolArgsSchema 装饰器，方法签名无需 args 参数
  // 2. 环境变量读取 — 平台通过环境变量注入配置，工具内通过 process.env 获取
  //    - BASE_ENV: 基础环境变量（如环境标识、服务地址等非敏感配置）
  //    - SENSITIVE_ENV: 敏感环境变量（如 API Key、Secret 等凭证信息）
  // --------------------------------------------------------------------------
  @MCPTool({ description: '获取平台注入的环境变量配置' })
  async getEnvConfigs(): Promise<MCPToolResponse> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            BASE_ENV: process.env.BASE_ENV ?? '',
            SENSITIVE_ENV: process.env.SENSITIVE_ENV ?? '',
          }),
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 请求Header读取：获取当前MCP请求的HTTP Header信息
  // --------------------------------------------------------------------------
  //
  // 演示以下用法：
  //
  // 1. @Extra() — 注入 ToolExtra 对象，包含请求的元信息
  //    - extra.requestInfo?.headers: 原始 HTTP 请求头（仅 HTTP 传输模式下可用）
  //    - extra.sessionId: MCP 会话 ID
  //    - extra.requestId: 请求 ID
  //    - extra.authInfo: 认证信息（如果启用了 OAuth）
  // 2. HTTP 传输（SSE/StreamableHTTP）下 requestInfo 有值
  //    stdio 传输下 requestInfo 为 undefined，需要做防御性判断
  // --------------------------------------------------------------------------
  @MCPTool({ description: '获取当前MCP请求的HTTP Header信息' })
  async getRequestHeaders(
    @Extra() extra: ToolExtra,
  ): Promise<MCPToolResponse> {
    const headers = extra.requestInfo?.headers;
    if (!headers) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              transport: 'stdio',
              headers: {},
              note: '当前为stdio传输模式，无HTTP请求对象',
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            transport: 'http',
            headers,
            header_keys: Object.keys(headers),
            session_id: extra.sessionId ?? null,
            request_id: extra.requestId ?? null,
          }),
        },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 外部API调用：调用JSONPlaceholder公共API获取模拟数据
  // --------------------------------------------------------------------------
  //
  // 演示以下用法：
  //
  // 1. 使用 Node.js 内置 fetch 调用外部 HTTP API
  //    - Node 18+ 原生支持 fetch，无需额外依赖
  //    - 使用 AbortSignal.timeout() 设置请求超时
  //    - 组合 extra.signal：当 MCP 客户端取消请求时，fetch 也会被中止
  // 2. z.enum() 限制参数为预定义值
  // 3. z.number().int().positive().optional() 可选正整数参数
  //
  // 如需认证，从环境变量读取 API Key 并设置请求头：
  //   const apiKey = process.env.API_KEY ?? '';
  //   headers: { 'Authorization': `Bearer ${apiKey}` }
  // --------------------------------------------------------------------------
  @MCPTool({ description: '调用JSONPlaceholder公共API获取模拟数据' })
  async fetchJsonplaceholder(
    @ToolArgsSchema(FetchJsonplaceholderArgsSchema) args: ToolArgs<typeof FetchJsonplaceholderArgsSchema>,
    @Extra() extra: ToolExtra,
  ): Promise<MCPToolResponse> {
    const url = args.resource_id
      ? `https://jsonplaceholder.typicode.com/${args.resource}/${args.resource_id}`
      : `https://jsonplaceholder.typicode.com/${args.resource}`;

    try {
      // 组合超时信号和客户端取消信号：任一触发都会中止请求
      const signals: AbortSignal[] = [AbortSignal.timeout(10_000)];
      if (extra.signal) signals.push(extra.signal);
      const signal = AbortSignal.any(signals);

      const resp = await fetch(url, { signal });
      if (!resp.ok) {
        return {
          content: [{ type: 'text', text: `HTTP错误: ${resp.status} ${resp.statusText}` }],
          isError: true,
        };
      }
      const data = await resp.json();
      // 读取响应头，用于确认是否开启 gzip 压缩
      const headers: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url,
              status_code: resp.status,
              headers,  // 包含 content-encoding 和 content-length
              data,
            }),
          },
        ],
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        content: [{ type: 'text', text: `请求失败: ${msg}` }],
        isError: true,
      };
    }
  }
}

// 运算符号映射（内部辅助函数，非 MCP 工具）
function symbolOf(operation: string): string {
  const symbols: Record<string, string> = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
  };
  return symbols[operation] ?? operation;
}