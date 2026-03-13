import { Inject, SingletonProto, AccessLevel, HttpClient } from 'chair/tegg';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})

export class HttpService {
  @Inject()
  private readonly httpclient: HttpClient;

  async callHttp(): Promise<string> {
    // 详细参数见 https://github.com/node-modules/urllib
    const res = await this.httpclient.request<string>('https://render.alipay.com/status.alipay', {
      dataType: 'text',
    });
    return res.data;
  }
}
