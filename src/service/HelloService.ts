import { SingletonProto, AccessLevel, Inject } from 'chair/tegg';
import { EchoFacade } from '@/oneapi/chairmosn/EchoFacade';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class HelloService {
  // 注入 EchoFacade，注意是小驼峰的命名
  @Inject()
  private echoFacade: EchoFacade;

  async echo(userId: string): Promise<string> {
    // 调用方法
    const result = await this.echoFacade.echo(userId, { message: `hello faas, userId: ${userId}` });
    return `hello, ${JSON.stringify(result)}`;
  }
}
