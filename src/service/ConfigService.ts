import { SingletonProto, AccessLevel, Inject } from 'chair/tegg';
import { ModuleConfig } from '@/src/ModuleConfig';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class ConfigService {
  // 注入配置
  @Inject()
  protected readonly moduleConfig: ModuleConfig;

  async echo(): Promise<string> {
    const message = await this.moduleConfig.foo.message;
    return `hello, ${message}`;
  }
}
