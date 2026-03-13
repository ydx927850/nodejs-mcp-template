import { strict as assert } from 'node:assert';
import { f } from '@alipay/chair-bin/unittest';
import { HttpService } from '@/src/service/HttpService';

describe('test/service/HttpService.test.ts', () => {
  it('call http should work', async () => {
    // 获取对象
    const httpService = await f.getEggObject(HttpService);
    const msg = await httpService.callHttp();
    // 方法结果断言
    assert(/success, online/.test(msg));
  });
});
