import { strict as assert } from 'node:assert';
import { f, mock } from '@alipay/chair-bin/unittest';
import { ConfigService } from '@/src/service/ConfigService';

describe('test/mgw/HelloMGW.test.ts', () => {
  it('should mgw hello work', async () => {
    // 使用 f.mgwRequest 进行 mgw 接口调用
    const res = await f.mgwRequest()
      // 指定调用的类和方法
      .invoke('EchoService.echo')
      // 方法入参
      .send({ foo: 'bar', userId: '208821123123123' })
      // mock 用户
      .user({
        userId: 'mock-userId',
      });
    // 响应接口断言
    assert.equal(res.resultStatus, 1000);
    assert.equal(res.result.data.foo, 'bar');
  });

  it('should config service work', async () => {
    // 获取对象
    const configService = await f.getEggObject(ConfigService);
    // 对对象进行 mock
    mock(configService, 'echo', async () => {
      return 'mocked echo';
    });
    const msg = await configService.echo();
    // 方法结果断言
    assert.equal(msg, 'mocked echo');
  });
});
