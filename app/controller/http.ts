import {
  MCPController,
  ToolArgs,
  MCPToolResponse,
  MCPTool,
  ToolArgsSchema,
} from '@alipay/tegg';
import * as z from 'zod/v4';

export const ToolType = {
  name: z.string().describe('npm package name'),
}

@MCPController()
export class MCPFooController {

  @MCPTool()
  // 请在这里用 typeof
  async bar(@ToolArgsSchema(ToolType) args: ToolArgs<typeof ToolType>): Promise<MCPToolResponse> {
    return {
      content: [
        {
          type: 'text',
          text: `海兔 npm 包: ${args.name} 不存在`,
        },
      ],
    };
  }
}