import {
  MGWController,
  MGWMethod,
  Inject,
  AlipayUser,
} from 'chair/tegg';

interface EchoRequest {
  foo: string;
  userId: string;
}

interface EchoResponse {
  data: EchoRequest;
}

@MGWController()
export default class EchoService {
  @Inject()
  private user: AlipayUser;

  @MGWMethod()
  async echo(data: EchoRequest): Promise<EchoResponse> {
    console.log('use: ', this.user);
    return {
      data,
    };
  }
}
